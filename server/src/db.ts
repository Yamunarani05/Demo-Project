import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool
let pool: Pool | null = null;
let useDatabase = false;

// ==========================================
// DATA MODELS & TYPES
// ==========================================

export type UserRole = 'super_admin' | 'studio_admin' | 'client' | 'photographer';

export type ShootStatus =
  | 'LEAD'
  | 'CONFIRMED'
  | 'PLANNED'
  | 'PHOTOGRAPHER_ASSIGNED'
  | 'SHOOTING'
  | 'SHOOT_COMPLETED'
  | 'UPLOADED'
  | 'SELECTION'
  | 'EDITING'
  | 'INTERNAL_REVIEW'
  | 'CLIENT_REVIEW'
  | 'CLIENT_APPROVED'
  | 'DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type ShootType =
  | 'Pre-Wedding'
  | 'Wedding'
  | 'Post-Wedding'
  | 'Engagement'
  | 'Baby Shoot'
  | 'Birthday'
  | 'Maternity'
  | 'Custom Shoot';

export interface StudioRecord {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo: string;
  coverImage?: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: 'active' | 'pending' | 'suspended';
  plan: string;
  activeShootsCount: number;
  completedShootsCount: number;
  totalRevenue: number;
  trialStartDate?: string;
  trialEndDate?: string;
  trialStatus?: 'Active Trial' | 'Expired' | 'Converted/Paid';
  created_at: string;
}

export interface UserRecord {
  id: string;
  studioId?: string; // Optional for Super Admin
  clientId?: string; // For client user
  photographerId?: string; // For photographer user
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  created_at: string;
}

export interface ClientRecord {
  id: string;
  studioId: string;
  name: string;
  coupleName: string;
  email: string;
  phone: string;
  eventDate: string;
  location: string;
  package: string;
  budget: number;
  notes: string;
  status: 'active' | 'completed' | 'lead';
  activeShootId?: string;
  created_at: string;
}

export interface PhotographerRecord {
  id: string;
  studioId: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  specialization: string[]; // ['Candid', 'Drone', 'Pre-Wedding', 'Traditional']
  experience: string; // e.g. "7 years"
  rating: number; // e.g. 4.9
  availabilityStatus: 'available' | 'on_shoot' | 'leave';
  assignedShootsCount: number;
  completedShootsCount: number;
  equipment?: string;
  bio?: string;
  created_at: string;
}

export interface ShootRecord {
  id: string;
  studioId: string;
  clientId: string;
  title: string;
  type: ShootType;
  shootDate: string;
  location: string;
  theme?: string;
  photographerId?: string;
  photographerName?: string;
  cinematographerId?: string;
  cinematographerName?: string;
  dronePilot?: string;
  makeupArtist?: string;
  costumeNotes?: string;
  locationsCount?: number;
  status: ShootStatus;
  progressPercent: number;
  photoCount: number;
  selectedPhotoCount: number;
  editedPhotoCount: number;
  packageAmount: number;
  paidAmount: number;
  notes?: string;
  deliverablesSummary?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhotoRecord {
  id: string;
  shootId: string;
  galleryId: string;
  studioId: string;
  url: string;
  thumbnail: string;
  title: string;
  category: 'Candid' | 'Portraits' | 'Ceremony' | 'Drone' | 'Decor' | 'Highlights';
  isFavorite: boolean;
  isSelected: boolean;
  isEdited: boolean;
  editStatus: 'raw' | 'in_progress' | 'edited' | 'client_approved';
  commentsCount: number;
  created_at: string;
}

export interface PhotoCommentRecord {
  id: string;
  photoId: string;
  shootId: string;
  authorName: string;
  authorRole: 'client' | 'studio_admin' | 'editor';
  text: string;
  timestamp: string;
}

export interface DeliverableRecord {
  id: string;
  shootId: string;
  studioId: string;
  title: string;
  type: 'raw_files' | 'high_res_album' | 'teaser_video' | 'cinematic_film' | 'framed_photos';
  downloadUrl: string;
  previewUrl?: string;
  fileSize: string;
  status: 'pending' | 'ready' | 'delivered';
  deliveredAt?: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  studioId: string;
  clientId: string;
  shootId: string;
  invoiceNumber: string;
  amount: number;
  status: 'paid' | 'pending' | 'partially_paid' | 'overdue';
  paymentMethod: string;
  date: string;
  dueDate: string;
  notes?: string;
}

export interface ActivityLogRecord {
  id: string;
  studioId: string;
  shootId?: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface NotificationRecord {
  id: string;
  studioId?: string;
  recipientRole: UserRole | 'all';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  isRead: boolean;
  link?: string;
  created_at: string;
}

// Contact / Demo / Newsletter for landing page
export interface ContactRecord {
  id: string | number;
  name: string;
  email: string;
  company?: string;
  message: string;
  created_at: string;
}

export interface DemoRequestRecord {
  id: string | number;
  name: string;
  email: string;
  company?: string;
  team_size?: string;
  plan_interest?: string;
  notes?: string;
  created_at: string;
}

export interface NewsletterRecord {
  id: string | number;
  email: string;
  subscribed_at: string;
}

// ==========================================
// IN-MEMORY DATABASE STORE WITH SEED DATA
// ==========================================

export const memoryStore = {
  studios: [] as StudioRecord[],
  users: [] as UserRecord[],
  clients: [] as ClientRecord[],
  photographers: [] as PhotographerRecord[],
  shoots: [] as ShootRecord[],
  photos: [] as GalleryPhotoRecord[],
  photoComments: [] as PhotoCommentRecord[],
  deliverables: [] as DeliverableRecord[],
  payments: [] as PaymentRecord[],
  activityLogs: [] as ActivityLogRecord[],
  notifications: [] as NotificationRecord[],
  contacts: [] as ContactRecord[],
  demoRequests: [] as DemoRequestRecord[],
  newsletterSubscribers: [] as NewsletterRecord[],
};

// ==========================================
// SEED DATA INITIALIZATION
// ==========================================

export function seedInitialData() {
  const now = new Date().toISOString();

  // 1. STUDIOS (6 Distinct Photography Studios)
  memoryStore.studios = [
    {
      id: 'studio_1',
      name: 'Red Angle Studio',
      slug: 'red-angle-studio',
      tagline: 'Premier Wedding & Cinematic Storytellers',
      logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      email: 'contact@redanglestudio.com',
      phone: '+91 98401 23456',
      city: 'Bangalore',
      state: 'Karnataka',
      status: 'active',
      plan: 'Studio Pro',
      activeShootsCount: 12,
      completedShootsCount: 48,
      totalRevenue: 2850000,
      created_at: '2025-01-10T10:00:00Z',
    },
    {
      id: 'studio_2',
      name: 'Pixel Stories Productions',
      slug: 'pixel-stories',
      tagline: 'Luxury Destination Weddings & Royal Shoots',
      logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80',
      email: 'hello@pixelstories.in',
      phone: '+91 98200 67890',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'active',
      plan: 'Enterprise',
      activeShootsCount: 8,
      completedShootsCount: 31,
      totalRevenue: 3420000,
      created_at: '2025-02-15T11:30:00Z',
    },
    {
      id: 'studio_3',
      name: 'Lens Studio & Co.',
      slug: 'lens-studio',
      tagline: 'Timeless South Indian Wedding Photographers',
      logo: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=80',
      email: 'connect@lensstudio.co',
      phone: '+91 98480 11223',
      city: 'Hyderabad',
      state: 'Telangana',
      status: 'active',
      plan: 'Studio Pro',
      activeShootsCount: 15,
      completedShootsCount: 52,
      totalRevenue: 3150000,
      created_at: '2025-01-20T09:15:00Z',
    },
    {
      id: 'studio_4',
      name: 'Royal Knot Cinematography',
      slug: 'royal-knot',
      tagline: 'Grand Heritage & Palace Weddings',
      logo: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&auto=format&fit=crop&q=80',
      email: 'bookings@royalknot.in',
      phone: '+91 99100 44556',
      city: 'Jaipur',
      state: 'Rajasthan',
      status: 'active',
      plan: 'Enterprise',
      activeShootsCount: 9,
      completedShootsCount: 27,
      totalRevenue: 4100000,
      created_at: '2025-03-01T14:00:00Z',
    },
    {
      id: 'studio_5',
      name: 'Vibrant Moments Photography',
      slug: 'vibrant-moments',
      tagline: 'Natural Light, Backwater & Candid Experts',
      logo: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&auto=format&fit=crop&q=80',
      email: 'info@vibrantmoments.com',
      phone: '+91 94470 55667',
      city: 'Kochi',
      state: 'Kerala',
      status: 'active',
      plan: 'Starter',
      activeShootsCount: 6,
      completedShootsCount: 19,
      totalRevenue: 1450000,
      created_at: '2025-03-12T16:45:00Z',
    },
    {
      id: 'studio_6',
      name: 'Aura Visuals',
      slug: 'aura-visuals',
      tagline: 'Hills & Nature Pre-Wedding Specialist',
      logo: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&auto=format&fit=crop&q=80',
      email: 'team@auravisuals.in',
      phone: '+91 98940 77889',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      status: 'pending',
      plan: 'Starter',
      activeShootsCount: 3,
      completedShootsCount: 8,
      totalRevenue: 620000,
      created_at: '2025-04-05T08:00:00Z',
    },
  ];

  // 2. USERS (Roles: Super Admin, Studio Admin, Client, Photographer)
  memoryStore.users = [
    {
      id: 'usr_super_admin',
      name: 'Rajesh Malhotra',
      email: 'master@greatmaster.io',
      role: 'super_admin',
      phone: '+91 98000 00001',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    },
    {
      id: 'usr_studio_1',
      studioId: 'studio_1',
      name: 'Vikram Sundaram (Dream Frames)',
      email: 'admin@dreamframes.in',
      role: 'studio_admin',
      phone: '+91 98401 23456',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    },
    {
      id: 'usr_studio_2',
      studioId: 'studio_2',
      name: 'Aakash Mehta (Pixel Stories)',
      email: 'admin@pixelstories.in',
      role: 'studio_admin',
      phone: '+91 98200 67890',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    },
    {
      id: 'usr_client_1',
      studioId: 'studio_1',
      clientId: 'client_1',
      name: 'Arun & Priya',
      email: 'arun.priya@gmail.com',
      role: 'client',
      phone: '+91 98840 98765',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    },
    {
      id: 'usr_client_2',
      studioId: 'studio_2',
      clientId: 'client_2',
      name: 'Rahul & Meena',
      email: 'rahul.meena@gmail.com',
      role: 'client',
      phone: '+91 97120 54321',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    },
    {
      id: 'usr_photographer_1',
      studioId: 'studio_1',
      photographerId: 'photo_1',
      name: 'Karthik Rajan',
      email: 'karthik@dreamframes.in',
      role: 'photographer',
      phone: '+91 98402 33445',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    },
  ];

  // 3. PHOTOGRAPHERS (15+ Photographers across studios)
  memoryStore.photographers = [
    // Studio 1 (Dream Frames)
    {
      id: 'photo_1',
      studioId: 'studio_1',
      name: 'Karthik Rajan',
      email: 'karthik@dreamframes.in',
      phone: '+91 98402 33445',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      specialization: ['Pre-Wedding', 'Candid', 'Portraits'],
      experience: '8 years',
      rating: 4.9,
      availabilityStatus: 'available',
      assignedShootsCount: 4,
      completedShootsCount: 38,
      equipment: 'Sony A7 IV, 24-70mm GM II, 85mm f/1.4 GM',
      bio: 'Award-winning candid & pre-wedding specialist passionate about golden-hour lighting and authentic emotions.',
      created_at: now,
    },
    {
      id: 'photo_2',
      studioId: 'studio_1',
      name: 'Vijay Anand',
      email: 'vijay@dreamframes.in',
      phone: '+91 98405 66778',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
      specialization: ['Cinematography', 'Drone', 'Pre-Wedding Film'],
      experience: '6 years',
      rating: 4.8,
      availabilityStatus: 'on_shoot',
      assignedShootsCount: 5,
      completedShootsCount: 29,
      equipment: 'FX3 Cine, DJI Mavic 3 Pro, Ronin RS3 Pro',
      bio: 'Cinematic visualizer crafting Hollywood-grade wedding teasers and 4K aerial masterpieces.',
      created_at: now,
    },
    {
      id: 'photo_3',
      studioId: 'studio_1',
      name: 'Suresh Kumar',
      email: 'suresh@dreamframes.in',
      phone: '+91 98409 11223',
      profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
      specialization: ['Traditional Wedding', 'Stage Photography'],
      experience: '12 years',
      rating: 4.7,
      availabilityStatus: 'available',
      assignedShootsCount: 3,
      completedShootsCount: 64,
      equipment: 'Nikon Z8, 70-200mm f/2.8, Godox AD600 Pro',
      bio: 'Master of ritual intricacies and traditional South Indian ceremonies with impeccable timing.',
      created_at: now,
    },
    {
      id: 'photo_4',
      studioId: 'studio_1',
      name: 'Ramesh Krishnan',
      email: 'ramesh@dreamframes.in',
      phone: '+91 98408 99887',
      profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
      specialization: ['Retouching', 'Album Design', 'Color Grading'],
      experience: '5 years',
      rating: 4.9,
      availabilityStatus: 'available',
      assignedShootsCount: 6,
      completedShootsCount: 42,
      equipment: 'Mac Studio M2 Ultra, ProArt 4K, DaVinci Resolve',
      bio: 'High-end fine art retoucher delivering magazine-quality tones and custom album layouts.',
      created_at: now,
    },
    // Studio 2 (Pixel Stories)
    {
      id: 'photo_5',
      studioId: 'studio_2',
      name: 'Rohan Deshmukh',
      email: 'rohan@pixelstories.in',
      phone: '+91 98201 22334',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      specialization: ['Destination Wedding', 'Candid', 'Royal Palace'],
      experience: '9 years',
      rating: 4.95,
      availabilityStatus: 'available',
      assignedShootsCount: 3,
      completedShootsCount: 45,
      equipment: 'Canon R5 C, RF 28-70mm f/2, Profoto B10X',
      bio: 'Luxury palace wedding storyteller featured in Vogue Weddings and WedMeGood.',
      created_at: now,
    },
    {
      id: 'photo_6',
      studioId: 'studio_2',
      name: 'Anita Sharma',
      email: 'anita@pixelstories.in',
      phone: '+91 98202 55667',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      specialization: ['Pre-Wedding', 'Maternity', 'Creative Direction'],
      experience: '7 years',
      rating: 4.9,
      availabilityStatus: 'available',
      assignedShootsCount: 4,
      completedShootsCount: 31,
      equipment: 'Sony A1, 50mm f/1.2 GM, 135mm f/1.8 GM',
      bio: 'Specialist in conceptual couple styling, vintage themes, and dreamy outdoor locations.',
      created_at: now,
    },
    {
      id: 'photo_7',
      studioId: 'studio_2',
      name: 'Sameer Khan',
      email: 'sameer@pixelstories.in',
      phone: '+91 98203 77889',
      profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
      specialization: ['Cinematography', 'Drone FPV', 'Teaser Edit'],
      experience: '5 years',
      rating: 4.85,
      availabilityStatus: 'on_shoot',
      assignedShootsCount: 3,
      completedShootsCount: 22,
      equipment: 'RED Komodo 6K, DJI Inspire 3',
      bio: 'High-octane visual creator delivering cinematic wedding films.',
      created_at: now,
    },
    // Studio 3 (Lens Studio)
    {
      id: 'photo_8',
      studioId: 'studio_3',
      name: 'Prasad Reddy',
      email: 'prasad@lensstudio.co',
      phone: '+91 98481 33445',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      specialization: ['Telugu Weddings', 'Pre-Wedding', 'Candid'],
      experience: '10 years',
      rating: 4.9,
      availabilityStatus: 'available',
      assignedShootsCount: 5,
      completedShootsCount: 58,
      equipment: 'Nikon Z9, 85mm f/1.2 S, 35mm f/1.4',
      bio: 'Veteran Telugu wedding photographer capturing grand celebratory moments.',
      created_at: now,
    },
    {
      id: 'photo_9',
      studioId: 'studio_3',
      name: 'Harika Naidu',
      email: 'harika@lensstudio.co',
      phone: '+91 98482 66778',
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
      specialization: ['Portraits', 'Baby Shoot', 'Maternity'],
      experience: '4 years',
      rating: 4.8,
      availabilityStatus: 'available',
      assignedShootsCount: 3,
      completedShootsCount: 24,
      equipment: 'Sony A7R V, 90mm Macro, Westcott strobes',
      bio: 'Gentle and artistic portraitist with a signature pastel aesthetic.',
      created_at: now,
    },
    // Studio 4 (Royal Knot)
    {
      id: 'photo_10',
      studioId: 'studio_4',
      name: 'Manish Rathore',
      email: 'manish@royalknot.in',
      phone: '+91 99101 22334',
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
      specialization: ['Palace Weddings', 'Fort Pre-Wedding', 'Heritage'],
      experience: '11 years',
      rating: 4.98,
      availabilityStatus: 'available',
      assignedShootsCount: 4,
      completedShootsCount: 41,
      equipment: 'Hasselblad X2D 100C, Sony A1 Cine',
      bio: 'Regal photographer capturing grand celebrations across Udaipur, Jaipur, and Jodhpur.',
      created_at: now,
    },
    // Studio 5 (Vibrant Moments)
    {
      id: 'photo_11',
      studioId: 'studio_5',
      name: 'Deepak Menon',
      email: 'deepak@vibrantmoments.com',
      phone: '+91 94471 22334',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      specialization: ['Kerala Weddings', 'Backwaters', 'Outdoor Sunset'],
      experience: '7 years',
      rating: 4.85,
      availabilityStatus: 'available',
      assignedShootsCount: 3,
      completedShootsCount: 28,
      equipment: 'Canon EOS R6 Mark II, RF 15-35mm, RF 70-200mm',
      bio: 'Kerala landscape and traditional temple wedding photographer.',
      created_at: now,
    },
    {
      id: 'photo_12',
      studioId: 'studio_5',
      name: 'Divya Balan',
      email: 'divya@vibrantmoments.com',
      phone: '+91 94472 55667',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      specialization: ['Candid', 'Retouching', 'Engagement'],
      experience: '5 years',
      rating: 4.8,
      availabilityStatus: 'available',
      assignedShootsCount: 2,
      completedShootsCount: 19,
      equipment: 'Sony A7 IV, Tamron 28-75mm G2, Godox V1',
      bio: 'Vibrant color grading and candid laughter capturer.',
      created_at: now,
    },
  ];

  // 4. CLIENTS (20+ Clients with realistic Indian couple names)
  memoryStore.clients = [
    // Studio 1 Clients
    {
      id: 'client_1',
      studioId: 'studio_1',
      name: 'Arun Kumar & Priya Dharshini',
      coupleName: 'Arun & Priya',
      email: 'arun.priya@gmail.com',
      phone: '+91 98840 98765',
      eventDate: '2026-09-15',
      location: 'Ooty & Coonoor, Tamil Nadu',
      package: 'Premium Pre-Wedding + Cinematic',
      budget: 185000,
      notes: 'Tea estate outdoor shoot, misty sunrise shoot, lake boathouse sunset.',
      status: 'active',
      activeShootId: 'shoot_1',
      created_at: '2026-06-10T10:00:00Z',
    },
    {
      id: 'client_2',
      studioId: 'studio_1',
      name: 'Karthik Subramanian & Divya Raman',
      coupleName: 'Karthik & Divya',
      email: 'karthik.divya@gmail.com',
      phone: '+91 98841 12345',
      eventDate: '2026-09-28',
      location: 'Mahabalipuram Beach Resort, Chennai',
      package: 'Complete Wedding Suite (3 Days)',
      budget: 350000,
      notes: 'Sangeet, Muhurtham, Beachside Reception, 4K Drone Film.',
      status: 'active',
      activeShootId: 'shoot_2',
      created_at: '2026-06-15T12:00:00Z',
    },
    {
      id: 'client_3',
      studioId: 'studio_1',
      name: 'Rohan Sharma & Pooja Hegde',
      coupleName: 'Rohan & Pooja',
      email: 'rohan.pooja@gmail.com',
      phone: '+91 98842 23456',
      eventDate: '2026-10-05',
      location: 'Nandi Hills & Palace Grounds, Bangalore',
      package: 'Pre-Wedding Royal Edition',
      budget: 140000,
      notes: 'Vintage cars concept, morning cloud view, sunset romance.',
      status: 'active',
      activeShootId: 'shoot_3',
      created_at: '2026-07-01T09:30:00Z',
    },
    {
      id: 'client_4',
      studioId: 'studio_1',
      name: 'Adithya Rao & Kavya Krishnan',
      coupleName: 'Adithya & Kavya',
      email: 'adithya.kavya@gmail.com',
      phone: '+91 98843 34567',
      eventDate: '2026-08-20',
      location: 'Coorg Coffee Plantation',
      package: 'Post-Wedding Romance',
      budget: 120000,
      notes: 'Rainforest aesthetic, rustic cottage shoots, waterfall portraits.',
      status: 'completed',
      activeShootId: 'shoot_4',
      created_at: '2026-05-10T14:20:00Z',
    },
    {
      id: 'client_5',
      studioId: 'studio_1',
      name: 'Siddharth Varma & Sneha Reddy',
      coupleName: 'Siddharth & Sneha',
      email: 'sid.sneha@gmail.com',
      phone: '+91 98844 45678',
      eventDate: '2026-10-25',
      location: 'Pondicherry French Quarter & Serenity Beach',
      package: 'Pre-Wedding Cinematic Master',
      budget: 160000,
      notes: 'Colonial heritage streets, beach sunrise, twilight fairy light shoot.',
      status: 'active',
      activeShootId: 'shoot_5',
      created_at: '2026-07-15T11:00:00Z',
    },
    // Studio 2 Clients (Pixel Stories)
    {
      id: 'client_6',
      studioId: 'studio_2',
      name: 'Rahul Kapoor & Meena Singhania',
      coupleName: 'Rahul & Meena',
      email: 'rahul.meena@gmail.com',
      phone: '+91 97120 54321',
      eventDate: '2026-09-22',
      location: 'Taj Fort Aguada, Goa',
      package: 'Destination Wedding 3-Day Ultra',
      budget: 650000,
      notes: 'Beach sundowner mehendi, pool party, ballroom reception.',
      status: 'active',
      activeShootId: 'shoot_6',
      created_at: '2026-06-01T15:00:00Z',
    },
    {
      id: 'client_7',
      studioId: 'studio_2',
      name: 'Vikram Joshi & Ananya Deshpande',
      coupleName: 'Vikram & Ananya',
      email: 'vikram.ananya@gmail.com',
      phone: '+91 97121 65432',
      eventDate: '2026-10-18',
      location: 'Alibaug Villa & Beach',
      package: 'Pre-Wedding & Engagement Luxe',
      budget: 220000,
      notes: 'Speedboat shoot, private villa sunset, bonfire night session.',
      status: 'active',
      activeShootId: 'shoot_7',
      created_at: '2026-07-02T16:30:00Z',
    },
    {
      id: 'client_8',
      studioId: 'studio_2',
      name: 'Nikhil Mehta & Riya Shah',
      coupleName: 'Nikhil & Riya',
      email: 'nikhil.riya@gmail.com',
      phone: '+91 97122 76543',
      eventDate: '2026-11-12',
      location: 'JW Marriott Sahar, Mumbai',
      package: 'Traditional Grand Wedding',
      budget: 480000,
      notes: 'Extensive candid coverage, live photo booth, fast-turnaround highlights.',
      status: 'active',
      activeShootId: 'shoot_8',
      created_at: '2026-07-20T10:15:00Z',
    },
    // Studio 3 Clients (Lens Studio)
    {
      id: 'client_9',
      studioId: 'studio_3',
      name: 'Rajesh Goud & Shalini Rao',
      coupleName: 'Rajesh & Shalini',
      email: 'rajesh.shalini@gmail.com',
      phone: '+91 98483 11990',
      eventDate: '2026-09-18',
      location: 'Ramoji Film City, Hyderabad',
      package: 'Pre-Wedding Epic Sets Package',
      budget: 190000,
      notes: 'European street set, Mughal garden, dramatic smoke effects.',
      status: 'active',
      activeShootId: 'shoot_9',
      created_at: '2026-06-25T13:45:00Z',
    },
    {
      id: 'client_10',
      studioId: 'studio_3',
      name: 'Varun Teja & Tanvi Reddy',
      coupleName: 'Varun & Tanvi',
      email: 'varun.tanvi@gmail.com',
      phone: '+91 98484 22881',
      eventDate: '2026-10-10',
      location: 'Novotel Hyderabad Convention Centre',
      package: 'Complete Telugu Wedding Package',
      budget: 390000,
      notes: 'Pellikuthuru, Mehendi, Sangeet, Muhurtham, Grand Reception.',
      status: 'active',
      activeShootId: 'shoot_10',
      created_at: '2026-07-08T17:00:00Z',
    },
    // Studio 4 Clients (Royal Knot)
    {
      id: 'client_11',
      studioId: 'studio_4',
      name: 'Harshvardhan Singh & Gayatri Rathore',
      coupleName: 'Harsh & Gayatri',
      email: 'harsh.gayatri@gmail.com',
      phone: '+91 99102 33445',
      eventDate: '2026-11-20',
      location: 'City Palace & Jagmandir, Udaipur',
      package: 'Royal Heritage Ultra Luxury',
      budget: 850000,
      notes: 'Lake Pichola boat arrival, heritage palace lighting, 8-camera cinematic crew.',
      status: 'active',
      activeShootId: 'shoot_11',
      created_at: '2026-05-18T10:00:00Z',
    },
    // Studio 5 Clients (Vibrant Moments)
    {
      id: 'client_12',
      studioId: 'studio_5',
      name: 'Manoj Varghese & Priyanka Nair',
      coupleName: 'Manoj & Priyanka',
      email: 'manoj.priyanka@gmail.com',
      phone: '+91 94473 66778',
      eventDate: '2026-09-30',
      location: 'Kumarakom Backwaters & Houseboat, Kerala',
      package: 'Backwater Pre-Wedding & Wedding',
      budget: 240000,
      notes: 'Traditional houseboat twilight shoot, Kathakali artists backdrop, backwater drone.',
      status: 'active',
      activeShootId: 'shoot_12',
      created_at: '2026-06-30T11:20:00Z',
    },
  ];

  // 5. SHOOTS (30+ Shoots spanning all 14 workflow stages)
  memoryStore.shoots = [
    // Shoot 1: Arun & Priya (Pre-Wedding in EDITING stage)
    {
      id: 'shoot_1',
      studioId: 'studio_1',
      clientId: 'client_1',
      title: 'Arun & Priya — Pre-Wedding Hills Story',
      type: 'Pre-Wedding',
      shootDate: '2026-09-15',
      location: 'Ooty (Pine Forest) + Coonoor (Tea Valley)',
      theme: 'Misty Romance & Sunset Glow',
      photographerId: 'photo_1',
      photographerName: 'Karthik Rajan',
      cinematographerId: 'photo_2',
      cinematographerName: 'Vijay Anand',
      dronePilot: 'Vijay Anand',
      makeupArtist: 'Preethi Bridal Artistry',
      costumeNotes: '3 Outfits: Royal Blue Silk Gown, Pastel Casuals, Burgundy Evening Suit',
      locationsCount: 3,
      status: 'EDITING',
      progressPercent: 68,
      photoCount: 850,
      selectedPhotoCount: 120,
      editedPhotoCount: 82,
      packageAmount: 185000,
      paidAmount: 120000,
      notes: 'Shoot successfully completed on Sep 1st. Client completed selection of 120 pictures. Currently in color grading & fine retouching.',
      deliverablesSummary: '120 Ultra-HD Retouched Photos, 3-Min Cinematic Teaser, 1 Instagram Reel, Premium Glass Cover Album',
      created_at: '2026-06-10T10:00:00Z',
      updated_at: now,
    },
    // Shoot 2: Karthik & Divya (Wedding in CLIENT_REVIEW stage)
    {
      id: 'shoot_2',
      studioId: 'studio_1',
      clientId: 'client_2',
      title: 'Karthik & Divya — Grand Beachside Wedding',
      type: 'Wedding',
      shootDate: '2026-09-28',
      location: 'InterContinental Chennai Mahabalipuram',
      theme: 'Traditional Pastel & Sunset Mandap',
      photographerId: 'photo_3',
      photographerName: 'Suresh Kumar',
      cinematographerId: 'photo_2',
      cinematographerName: 'Vijay Anand',
      makeupArtist: 'Meenakshi Bridal Glam',
      status: 'CLIENT_REVIEW',
      progressPercent: 85,
      photoCount: 2200,
      selectedPhotoCount: 350,
      editedPhotoCount: 350,
      packageAmount: 350000,
      paidAmount: 280000,
      notes: 'All 350 selected photos edited and dispatched to client gallery for final sign-off.',
      created_at: '2026-06-15T12:00:00Z',
      updated_at: now,
    },
    // Shoot 3: Rohan & Pooja (Pre-Wedding in PLANNED stage)
    {
      id: 'shoot_3',
      studioId: 'studio_1',
      clientId: 'client_3',
      title: 'Rohan & Pooja — Nandi Hills Sunrise',
      type: 'Pre-Wedding',
      shootDate: '2026-10-05',
      location: 'Nandi Hills & Grover Zampa Vineyards, Bangalore',
      theme: 'Vineyard Chic & Cloudtop Romance',
      photographerId: 'photo_1',
      photographerName: 'Karthik Rajan',
      status: 'PLANNED',
      progressPercent: 25,
      photoCount: 0,
      selectedPhotoCount: 0,
      editedPhotoCount: 0,
      packageAmount: 140000,
      paidAmount: 50000,
      notes: 'Call sheet prepared. Drone clearance obtained for vineyard.',
      created_at: '2026-07-01T09:30:00Z',
      updated_at: now,
    },
    // Shoot 4: Adithya & Kavya (Post-Wedding in COMPLETED stage)
    {
      id: 'shoot_4',
      studioId: 'studio_1',
      clientId: 'client_4',
      title: 'Adithya & Kavya — Coorg Rainforest Romance',
      type: 'Post-Wedding',
      shootDate: '2026-08-20',
      location: 'Evolve Back Resort, Coorg',
      theme: 'Lush Green & Misty Waterfalls',
      photographerId: 'photo_1',
      photographerName: 'Karthik Rajan',
      status: 'COMPLETED',
      progressPercent: 100,
      photoCount: 650,
      selectedPhotoCount: 90,
      editedPhotoCount: 90,
      packageAmount: 120000,
      paidAmount: 120000,
      notes: 'Complete album and high-res files delivered. Client rated 5-stars.',
      created_at: '2026-05-10T14:20:00Z',
      updated_at: now,
    },
    // Shoot 5: Siddharth & Sneha (Pre-Wedding in SELECTION stage)
    {
      id: 'shoot_5',
      studioId: 'studio_1',
      clientId: 'client_5',
      title: 'Siddharth & Sneha — French Quarter & Serenity Beach',
      type: 'Pre-Wedding',
      shootDate: '2026-10-25',
      location: 'White Town & Paradise Beach, Pondicherry',
      theme: 'Vintage French Pastel & Ocean Breeze',
      photographerId: 'photo_1',
      photographerName: 'Karthik Rajan',
      cinematographerId: 'photo_2',
      cinematographerName: 'Vijay Anand',
      status: 'SELECTION',
      progressPercent: 55,
      photoCount: 920,
      selectedPhotoCount: 75,
      editedPhotoCount: 0,
      packageAmount: 160000,
      paidAmount: 80000,
      notes: 'Photos uploaded to gallery. Client currently shortlisting their 100 favorite shots.',
      created_at: '2026-07-15T11:00:00Z',
      updated_at: now,
    },
    // Shoot 6: Rahul & Meena (Destination Wedding in SHOOTING stage)
    {
      id: 'shoot_6',
      studioId: 'studio_2',
      clientId: 'client_6',
      title: 'Rahul & Meena — Luxury Beach Wedding in Goa',
      type: 'Wedding',
      shootDate: '2026-09-22',
      location: 'Taj Fort Aguada & Morjim Beach, Goa',
      theme: 'Bohemian Sunset & Royal Sangeet',
      photographerId: 'photo_5',
      photographerName: 'Rohan Deshmukh',
      cinematographerId: 'photo_7',
      cinematographerName: 'Sameer Khan',
      status: 'SHOOTING',
      progressPercent: 35,
      photoCount: 1400,
      selectedPhotoCount: 0,
      editedPhotoCount: 0,
      packageAmount: 650000,
      paidAmount: 350000,
      notes: 'Day 2 Mehendi and Sangeet in progress. Raw footage backup underway.',
      created_at: '2026-06-01T15:00:00Z',
      updated_at: now,
    },
    // Shoot 7: Vikram & Ananya (Pre-Wedding in INTERNAL_REVIEW stage)
    {
      id: 'shoot_7',
      studioId: 'studio_2',
      clientId: 'client_7',
      title: 'Vikram & Ananya — Alibaug Coastal Pre-Wedding',
      type: 'Pre-Wedding',
      shootDate: '2026-10-18',
      location: 'Awas Beach & Private Beach Villa, Alibaug',
      theme: 'Yacht Sunset & Minimalist Luxury',
      photographerId: 'photo_6',
      photographerName: 'Anita Sharma',
      status: 'INTERNAL_REVIEW',
      progressPercent: 78,
      photoCount: 780,
      selectedPhotoCount: 110,
      editedPhotoCount: 110,
      packageAmount: 220000,
      paidAmount: 150000,
      notes: 'Lead editor completed color toning. Lead photographer performing final QC before client dispatch.',
      created_at: '2026-07-02T16:30:00Z',
      updated_at: now,
    },
    // Shoot 8: Nikhil & Riya (Wedding in CONFIRMED stage)
    {
      id: 'shoot_8',
      studioId: 'studio_2',
      clientId: 'client_8',
      title: 'Nikhil & Riya — Grand Mumbai Ballroom Wedding',
      type: 'Wedding',
      shootDate: '2026-11-12',
      location: 'JW Marriott Sahar, Mumbai',
      theme: 'Royal Ivory & Crimson Elegance',
      photographerId: 'photo_5',
      photographerName: 'Rohan Deshmukh',
      status: 'CONFIRMED',
      progressPercent: 15,
      photoCount: 0,
      selectedPhotoCount: 0,
      editedPhotoCount: 0,
      packageAmount: 480000,
      paidAmount: 150000,
      notes: 'Booking advance received. Pre-shoot alignment meeting scheduled next week.',
      created_at: '2026-07-20T10:15:00Z',
      updated_at: now,
    },
    // Shoot 9: Rajesh & Shalini (Pre-Wedding in CLIENT_APPROVED stage)
    {
      id: 'shoot_9',
      studioId: 'studio_3',
      clientId: 'client_9',
      title: 'Rajesh & Shalini — Ramoji Film City Fantasy',
      type: 'Pre-Wedding',
      shootDate: '2026-09-18',
      location: 'Ramoji Film City, Hyderabad',
      theme: 'Cinematic Dreamscape & Period Romance',
      photographerId: 'photo_8',
      photographerName: 'Prasad Reddy',
      status: 'CLIENT_APPROVED',
      progressPercent: 92,
      photoCount: 950,
      selectedPhotoCount: 130,
      editedPhotoCount: 130,
      packageAmount: 190000,
      paidAmount: 190000,
      notes: 'Client reviewed and approved all 130 retouched photos. Final album sent to printing press.',
      created_at: '2026-06-25T13:45:00Z',
      updated_at: now,
    },
    // Shoot 10: Varun & Tanvi (Wedding in PHOTOGRAPHER_ASSIGNED stage)
    {
      id: 'shoot_10',
      studioId: 'studio_3',
      clientId: 'client_10',
      title: 'Varun & Tanvi — Hyderabad Convention Wedding',
      type: 'Wedding',
      shootDate: '2026-10-10',
      location: 'HICC Novotel, Hyderabad',
      theme: 'Grand Gold & Floral Mandap',
      photographerId: 'photo_8',
      photographerName: 'Prasad Reddy',
      status: 'PHOTOGRAPHER_ASSIGNED',
      progressPercent: 20,
      photoCount: 0,
      selectedPhotoCount: 0,
      editedPhotoCount: 0,
      packageAmount: 390000,
      paidAmount: 120000,
      notes: 'Photographer team allocated. Shot list agreed upon.',
      created_at: '2026-07-08T17:00:00Z',
      updated_at: now,
    },
    // Shoot 11: Harsh & Gayatri (Royal Knot Wedding in LEAD stage)
    {
      id: 'shoot_11',
      studioId: 'studio_4',
      clientId: 'client_11',
      title: 'Harsh & Gayatri — Udaipur City Palace Celebration',
      type: 'Wedding',
      shootDate: '2026-11-20',
      location: 'City Palace, Udaipur, Rajasthan',
      theme: 'Mewar Royalty & Heritage Fireworks',
      photographerId: 'photo_10',
      photographerName: 'Manish Rathore',
      status: 'LEAD',
      progressPercent: 10,
      photoCount: 0,
      selectedPhotoCount: 0,
      editedPhotoCount: 0,
      packageAmount: 850000,
      paidAmount: 0,
      notes: 'Custom proposal submitted with 8-camera setup and master drone cinematography.',
      created_at: '2026-05-18T10:00:00Z',
      updated_at: now,
    },
    // Shoot 12: Manoj & Priyanka (Vibrant Moments in DELIVERY stage)
    {
      id: 'shoot_12',
      studioId: 'studio_5',
      clientId: 'client_12',
      title: 'Manoj & Priyanka — Kumarakom Backwater Magic',
      type: 'Pre-Wedding',
      shootDate: '2026-09-30',
      location: 'Kumarakom & Alleppey Houseboat, Kerala',
      theme: 'Emerald Waters & Traditional Kerala Kasavu',
      photographerId: 'photo_11',
      photographerName: 'Deepak Menon',
      status: 'DELIVERY',
      progressPercent: 96,
      photoCount: 720,
      selectedPhotoCount: 95,
      editedPhotoCount: 95,
      packageAmount: 240000,
      paidAmount: 240000,
      notes: 'Album printed and dispatched via courier. Download links generated.',
      created_at: '2026-06-30T11:20:00Z',
      updated_at: now,
    },
  ];

  // 6. GALLERY PHOTOS (For Shoot 1 Arun & Priya, Shoot 2, Shoot 5)
  const samplePhotoUrls = [
    {
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
      title: 'Pine Forest Golden Hour Couple Hug',
      category: 'Portraits' as const,
      isFavorite: true,
      isSelected: true,
      isEdited: true,
      editStatus: 'edited' as const,
      commentsCount: 2,
    },
    {
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop&q=80',
      title: 'Misty Tea Garden Walking Hand-in-Hand',
      category: 'Highlights' as const,
      isFavorite: true,
      isSelected: true,
      isEdited: true,
      editStatus: 'edited' as const,
      commentsCount: 1,
    },
    {
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&auto=format&fit=crop&q=80',
      title: 'Close-Up Emotional Forehead Kiss',
      category: 'Candid' as const,
      isFavorite: true,
      isSelected: true,
      isEdited: true,
      editStatus: 'edited' as const,
      commentsCount: 3,
    },
    {
      url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=400&auto=format&fit=crop&q=80',
      title: 'Aerial View of Couple in Lake Boat',
      category: 'Drone' as const,
      isFavorite: true,
      isSelected: true,
      isEdited: true,
      editStatus: 'edited' as const,
      commentsCount: 0,
    },
    {
      url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&auto=format&fit=crop&q=80',
      title: 'Sunset Silhouette by the Lake',
      category: 'Portraits' as const,
      isFavorite: false,
      isSelected: true,
      isEdited: true,
      editStatus: 'edited' as const,
      commentsCount: 1,
    },
    {
      url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&auto=format&fit=crop&q=80',
      title: 'Laughing Candid Candid Stride in Tea Bush',
      category: 'Candid' as const,
      isFavorite: true,
      isSelected: true,
      isEdited: false,
      editStatus: 'in_progress' as const,
      commentsCount: 0,
    },
    {
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      title: 'Bride Bridal Solo Portrait under Veil',
      category: 'Portraits' as const,
      isFavorite: true,
      isSelected: true,
      isEdited: true,
      editStatus: 'edited' as const,
      commentsCount: 2,
    },
    {
      url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      title: 'Groom Portrait with Vintage Automobile',
      category: 'Portraits' as const,
      isFavorite: false,
      isSelected: true,
      isEdited: false,
      editStatus: 'in_progress' as const,
      commentsCount: 0,
    },
    {
      url: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=1200&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=400&auto=format&fit=crop&q=80',
      title: 'Couple Ring Detail & Floral Bouquet',
      category: 'Decor' as const,
      isFavorite: false,
      isSelected: true,
      isEdited: true,
      editStatus: 'edited' as const,
      commentsCount: 0,
    },
  ];

  memoryStore.photos = samplePhotoUrls.map((p, idx) => ({
    id: `photo_item_${idx + 1}`,
    shootId: 'shoot_1',
    galleryId: 'gal_1',
    studioId: 'studio_1',
    url: p.url,
    thumbnail: p.thumb,
    title: p.title,
    category: p.category,
    isFavorite: p.isFavorite,
    isSelected: p.isSelected,
    isEdited: p.isEdited,
    editStatus: p.editStatus,
    commentsCount: p.commentsCount,
    created_at: '2026-09-02T10:00:00Z',
  }));

  // 7. PHOTO COMMENTS
  memoryStore.photoComments = [
    {
      id: 'comm_1',
      photoId: 'photo_item_1',
      shootId: 'shoot_1',
      authorName: 'Priya Dharshini',
      authorRole: 'client',
      text: 'We absolutely love the warm golden tones here! Please include this for the album cover.',
      timestamp: '2026-09-02T11:15:00Z',
    },
    {
      id: 'comm_2',
      photoId: 'photo_item_1',
      shootId: 'shoot_1',
      authorName: 'Ramesh Krishnan (Editor)',
      authorRole: 'editor',
      text: 'Understood! I will do fine skin retouching and calibrate high-res CMYK profile for the album.',
      timestamp: '2026-09-02T11:45:00Z',
    },
    {
      id: 'comm_3',
      photoId: 'photo_item_3',
      shootId: 'shoot_1',
      authorName: 'Arun Kumar',
      authorRole: 'client',
      text: 'Can we soften the background leaves just slightly? Otherwise this expression is perfect!',
      timestamp: '2026-09-02T12:00:00Z',
    },
  ];

  // 8. DELIVERABLES
  memoryStore.deliverables = [
    {
      id: 'deliv_1',
      shootId: 'shoot_1',
      studioId: 'studio_1',
      title: 'Full Resolution Curated Photos (120 JPEG)',
      type: 'high_res_album',
      downloadUrl: 'https://drive.google.com/sample-download/arun-priya-highres.zip',
      fileSize: '2.8 GB',
      status: 'ready',
      created_at: '2026-09-02T09:00:00Z',
    },
    {
      id: 'deliv_2',
      shootId: 'shoot_1',
      studioId: 'studio_1',
      title: '4K Cinematic Pre-Wedding Teaser Film (ProRes)',
      type: 'teaser_video',
      downloadUrl: 'https://vimeo.com/sample/arun-priya-teaser-4k',
      previewUrl: 'https://vimeo.com/sample/preview',
      fileSize: '4.5 GB',
      status: 'ready',
      created_at: '2026-09-02T09:30:00Z',
    },
    {
      id: 'deliv_3',
      shootId: 'shoot_1',
      studioId: 'studio_1',
      title: 'Handcrafted Flushmount Leather Photo Album (35 Spreads)',
      type: 'framed_photos',
      downloadUrl: 'https://sample-album.pdf',
      fileSize: '450 MB',
      status: 'pending',
      created_at: '2026-09-02T10:00:00Z',
    },
  ];

  // 9. PAYMENTS / INVOICES
  memoryStore.payments = [
    {
      id: 'pay_1',
      studioId: 'studio_1',
      clientId: 'client_1',
      shootId: 'shoot_1',
      invoiceNumber: 'INV-DF-2026-081',
      amount: 60000,
      status: 'paid',
      paymentMethod: 'UPI / HDFC Bank',
      date: '2026-06-10',
      dueDate: '2026-06-10',
      notes: 'Initial Booking Advance (30%)',
    },
    {
      id: 'pay_2',
      studioId: 'studio_1',
      clientId: 'client_1',
      shootId: 'shoot_1',
      invoiceNumber: 'INV-DF-2026-094',
      amount: 60000,
      status: 'paid',
      paymentMethod: 'NetBanking',
      date: '2026-09-01',
      dueDate: '2026-09-01',
      notes: 'On-Shoot Date Milestone Payment (30%)',
    },
    {
      id: 'pay_3',
      studioId: 'studio_1',
      clientId: 'client_1',
      shootId: 'shoot_1',
      invoiceNumber: 'INV-DF-2026-102',
      amount: 65000,
      status: 'pending',
      paymentMethod: 'Pending (Due upon delivery)',
      date: '2026-09-15',
      dueDate: '2026-09-25',
      notes: 'Final Balance Payment upon Album Dispatch (40%)',
    },
  ];

  // 10. ACTIVITY LOGS (Recent Real-time Activity)
  memoryStore.activityLogs = [
    {
      id: 'act_1',
      studioId: 'studio_1',
      shootId: 'shoot_1',
      actorName: 'Client (Arun & Priya)',
      actorRole: 'Client',
      action: 'Selected 120 Photos',
      details: 'Client finished shortlisting 120 pictures from Ooty shoot and submitted notes for color grading.',
      timestamp: '10 mins ago',
    },
    {
      id: 'act_2',
      studioId: 'studio_1',
      shootId: 'shoot_1',
      actorName: 'Ramesh Krishnan',
      actorRole: 'Editor',
      action: 'Editing In Progress',
      details: 'Retouched 82 of 120 shortlisted photos with misty pine tones.',
      timestamp: '25 mins ago',
    },
    {
      id: 'act_3',
      studioId: 'studio_2',
      shootId: 'shoot_6',
      actorName: 'Rohan Deshmukh',
      actorRole: 'Photographer',
      action: 'Uploaded 1,400 Photos',
      details: 'Uploaded Day 1 Mehendi and Beach sunset RAW footage for Rahul & Meena.',
      timestamp: '1 hour ago',
    },
    {
      id: 'act_4',
      studioId: 'studio_3',
      shootId: 'shoot_9',
      actorName: 'Client (Rajesh & Shalini)',
      actorRole: 'Client',
      action: 'Approved Final Gallery',
      details: 'Client approved all 130 retouched frames for print production.',
      timestamp: '2 hours ago',
    },
    {
      id: 'act_5',
      studioId: 'studio_1',
      shootId: 'shoot_2',
      actorName: 'Vikram Sundaram',
      actorRole: 'Studio Admin',
      action: 'Dispatched for Client Review',
      details: 'Sent 350 retouched wedding pictures to Karthik & Divya for approval.',
      timestamp: '3 hours ago',
    },
  ];

  // 11. NOTIFICATIONS
  memoryStore.notifications = [
    {
      id: 'notif_1',
      studioId: 'studio_1',
      recipientRole: 'studio_admin',
      title: 'Photo Selection Complete',
      message: 'Arun & Priya completed selection of 120 photos for their Pre-Wedding shoot.',
      type: 'success',
      isRead: false,
      link: '/studio/shoots/shoot_1',
      created_at: '10 mins ago',
    },
    {
      id: 'notif_2',
      studioId: 'studio_1',
      recipientRole: 'photographer',
      title: 'Upcoming Shoot in 3 Days',
      message: 'Karthik Rajan assigned to Rohan & Pooja Nandi Hills Pre-Wedding Shoot.',
      type: 'info',
      isRead: false,
      link: '/studio/shoots/shoot_3',
      created_at: '1 hour ago',
    },
    {
      id: 'notif_3',
      studioId: 'studio_1',
      recipientRole: 'client',
      title: 'Edited Gallery Ready for Review',
      message: 'Dream Frames has uploaded 82 retouched photos to your project gallery.',
      type: 'info',
      isRead: false,
      link: '/client/gallery/shoot_1',
      created_at: '2 hours ago',
    },
    {
      id: 'notif_4',
      recipientRole: 'super_admin',
      title: 'New Studio Application',
      message: 'Aura Visuals (Coimbatore) has submitted credentials for Great Master approval.',
      type: 'warning',
      isRead: false,
      link: '/master/studios/studio_6',
      created_at: '3 hours ago',
    },
  ];
}

// Call seed immediately
seedInitialData();

// ==========================================
// POSTGRESQL INITIALIZER & TABLES
// ==========================================

export async function initializeDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      });

      const client = await pool.connect();
      console.log('Connected to PostgreSQL database for Great Master.');

      // Run Schema Migrations
      await client.query(`
        CREATE TABLE IF NOT EXISTS studios (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          tagline TEXT,
          logo TEXT,
          cover_image TEXT,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          city VARCHAR(100),
          state VARCHAR(100),
          status VARCHAR(50) DEFAULT 'active',
          plan VARCHAR(50) DEFAULT 'Studio Pro',
          active_shoots_count INT DEFAULT 0,
          completed_shoots_count INT DEFAULT 0,
          total_revenue NUMERIC DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          studio_id VARCHAR(100),
          client_id VARCHAR(100),
          photographer_id VARCHAR(100),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          role VARCHAR(50) NOT NULL,
          phone VARCHAR(50),
          avatar TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS clients (
          id VARCHAR(100) PRIMARY KEY,
          studio_id VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          couple_name VARCHAR(255),
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          event_date DATE,
          location TEXT,
          package VARCHAR(255),
          budget NUMERIC DEFAULT 0,
          notes TEXT,
          status VARCHAR(50) DEFAULT 'active',
          active_shoot_id VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS photographers (
          id VARCHAR(100) PRIMARY KEY,
          studio_id VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          profile_image TEXT,
          specialization JSONB,
          experience VARCHAR(50),
          rating NUMERIC DEFAULT 5.0,
          availability_status VARCHAR(50) DEFAULT 'available',
          assigned_shoots_count INT DEFAULT 0,
          completed_shoots_count INT DEFAULT 0,
          equipment TEXT,
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS shoots (
          id VARCHAR(100) PRIMARY KEY,
          studio_id VARCHAR(100) NOT NULL,
          client_id VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          shoot_date DATE NOT NULL,
          location TEXT,
          theme TEXT,
          photographer_id VARCHAR(100),
          photographer_name VARCHAR(255),
          cinematographer_id VARCHAR(100),
          cinematographer_name VARCHAR(255),
          drone_pilot VARCHAR(255),
          makeup_artist VARCHAR(255),
          costume_notes TEXT,
          locations_count INT DEFAULT 1,
          status VARCHAR(50) DEFAULT 'LEAD',
          progress_percent INT DEFAULT 0,
          photo_count INT DEFAULT 0,
          selected_photo_count INT DEFAULT 0,
          edited_photo_count INT DEFAULT 0,
          package_amount NUMERIC DEFAULT 0,
          paid_amount NUMERIC DEFAULT 0,
          notes TEXT,
          deliverables_summary TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS photos (
          id VARCHAR(100) PRIMARY KEY,
          shoot_id VARCHAR(100) NOT NULL,
          gallery_id VARCHAR(100),
          studio_id VARCHAR(100) NOT NULL,
          url TEXT NOT NULL,
          thumbnail TEXT NOT NULL,
          title VARCHAR(255),
          category VARCHAR(100) DEFAULT 'Portraits',
          is_favorite BOOLEAN DEFAULT FALSE,
          is_selected BOOLEAN DEFAULT FALSE,
          is_edited BOOLEAN DEFAULT FALSE,
          edit_status VARCHAR(50) DEFAULT 'raw',
          comments_count INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS deliverables (
          id VARCHAR(100) PRIMARY KEY,
          shoot_id VARCHAR(100) NOT NULL,
          studio_id VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          download_url TEXT NOT NULL,
          preview_url TEXT,
          file_size VARCHAR(50),
          status VARCHAR(50) DEFAULT 'pending',
          delivered_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(100) PRIMARY KEY,
          studio_id VARCHAR(100) NOT NULL,
          client_id VARCHAR(100) NOT NULL,
          shoot_id VARCHAR(100),
          invoice_number VARCHAR(100) NOT NULL,
          amount NUMERIC NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(100),
          date DATE,
          due_date DATE,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS activity_logs (
          id VARCHAR(100) PRIMARY KEY,
          studio_id VARCHAR(100) NOT NULL,
          shoot_id VARCHAR(100),
          actor_name VARCHAR(255) NOT NULL,
          actor_role VARCHAR(100),
          action VARCHAR(255) NOT NULL,
          details TEXT,
          timestamp VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(100) PRIMARY KEY,
          studio_id VARCHAR(100),
          recipient_role VARCHAR(50) DEFAULT 'all',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          is_read BOOLEAN DEFAULT FALSE,
          link TEXT,
          created_at VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS demo_requests (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          team_size VARCHAR(50),
          plan_interest VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      client.release();
      useDatabase = true;
      console.log('PostgreSQL database verified & Great Master schema active.');
    } catch (err: any) {
      console.warn('⚠️ PostgreSQL connection fallback: Running in active in-memory seed store.', err?.message || err);
      useDatabase = false;
    }
  } else {
    console.log('ℹ️ Running Great Master with rich in-memory persistent store & Indian demo data.');
    useDatabase = false;
  }
}

// Landing Page helper methods
export async function saveContact(data: Omit<ContactRecord, 'id' | 'created_at'>): Promise<ContactRecord> {
  const record: ContactRecord = {
    id: `cont_${Date.now()}`,
    ...data,
    created_at: new Date().toISOString(),
  };
  memoryStore.contacts.push(record);
  return record;
}

export async function saveDemoRequest(data: Omit<DemoRequestRecord, 'id' | 'created_at'>): Promise<DemoRequestRecord> {
  const record: DemoRequestRecord = {
    id: `demo_${Date.now()}`,
    ...data,
    created_at: new Date().toISOString(),
  };
  memoryStore.demoRequests.push(record);
  return record;
}

export async function saveNewsletterSubscriber(email: string): Promise<NewsletterRecord> {
  const existing = memoryStore.newsletterSubscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const record: NewsletterRecord = {
    id: `sub_${Date.now()}`,
    email,
    subscribed_at: new Date().toISOString(),
  };
  memoryStore.newsletterSubscribers.push(record);
  return record;
}

export function getDatabaseStatus() {
  return {
    isPostgresConnected: useDatabase,
    studiosCount: memoryStore.studios.length,
    clientsCount: memoryStore.clients.length,
    photographersCount: memoryStore.photographers.length,
    shootsCount: memoryStore.shoots.length,
    photosCount: memoryStore.photos.length,
    deliverablesCount: memoryStore.deliverables.length,
  };
}
