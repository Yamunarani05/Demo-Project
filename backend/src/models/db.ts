import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// PostgreSQL connection pool
let pool: Pool | null = null;
let useDatabase = false;

// ==========================================
// DATA MODELS & TYPES
// ==========================================

export type UserRole = 'great_master' | 'super_admin' | 'studio_admin' | 'client' | 'photographer';

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
  referenceEmail?: string;
  phone: string;
  city: string;
  state: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected' | 'approved';
  plan: string;
  amount?: number;
  activeShootsCount: number;
  completedShootsCount: number;
  totalRevenue: number;
  registrationDate?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  trialStatus?: 'PENDING' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CONVERTED' | 'Active Trial' | 'Expired' | 'Converted/Paid';
  paymentStatus?: 'PENDING' | 'PAYMENT_PENDING' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED';
  created_at: string;
}

export interface EmailLogRecord {
  id: string;
  studioId?: string;
  emailType: 'REGISTRATION_RECEIVED' | 'TRIAL_APPROVED' | 'TRIAL_REJECTED' | 'TRIAL_EXPIRED' | 'PAYMENT_REQUESTED' | 'PAYMENT_SUCCESS';
  recipient: string;
  subject: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
  previewUrl?: string;
  details?: string;
}

export interface PaymentTransactionRecord {
  id: string;
  studioId: string;
  userId?: string;
  plan: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'PAYMENT_PENDING' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED';
  paymentDate?: string;
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
  passwordHash?: string;
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
// SALES & CLIENT WORKSPACE MODELS
// ==========================================

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'QUOTATION_SENT'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'LOST';

export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'NEGOTIATION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type FollowUpStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'MISSED'
  | 'RESCHEDULED';

export interface LeadRecord {
  id: string;
  leadCode: string;
  studioId: string;
  clientName: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  location: string;
  source: string;
  estimatedBudget: number;
  interestedPackage: string;
  status: LeadStatus;
  assignedSalesPerson: string;
  lastContacted: string;
  nextFollowUp: string;
  notes: string;
  created_at: string;
  convertedClientId?: string;
  convertedProjectId?: string;
}

export interface QuotationAddon {
  name: string;
  price: number;
}

export interface QuotationRecord {
  id: string;
  quotationNumber: string;
  studioId: string;
  leadId?: string;
  clientId?: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  eventType: string;
  eventDate: string;
  location: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  addons: QuotationAddon[];
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  validUntil: string;
  notes: string;
  status: QuotationStatus;
  created_at: string;
  sentAt?: string;
  acceptedAt?: string;
}

export interface PackageRecord {
  id: string;
  studioId: string;
  name: string;
  category: 'Wedding' | 'Pre-Wedding' | 'Portrait' | 'Event' | 'Commercial';
  description: string;
  price: number;
  duration: string;
  photographersCount: number;
  editedPhotosCount: number;
  album: string;
  video: string;
  addons: string[];
  availability: string;
  status: 'active' | 'inactive';
}

export interface FollowUpRecord {
  id: string;
  studioId: string;
  leadId: string;
  clientName: string;
  contact: string;
  followUpDate: string; // YYYY-MM-DD
  followUpTime: string; // e.g. "11:30 AM"
  contactMethod: 'Phone Call' | 'WhatsApp' | 'In-Person Meeting' | 'Email';
  status: FollowUpStatus;
  notes: string;
  assignedPerson: string;
  created_at: string;
}

export interface SalesActivityRecord {
  id: string;
  studioId: string;
  type:
    | 'lead_created'
    | 'lead_contacted'
    | 'followup_scheduled'
    | 'followup_completed'
    | 'quotation_created'
    | 'quotation_sent'
    | 'quotation_viewed'
    | 'quotation_accepted'
    | 'client_converted'
    | 'project_created'
    | 'moved_to_preproduction';
  title: string;
  details: string;
  leadId?: string;
  clientId?: string;
  quotationId?: string;
  projectId?: string;
  actor: string;
  timestamp: string;
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
  emailLogs: [] as EmailLogRecord[],
  paymentTransactions: [] as PaymentTransactionRecord[],
  leads: [] as LeadRecord[],
  quotations: [] as QuotationRecord[],
  packages: [] as PackageRecord[],
  followUps: [] as FollowUpRecord[],
  salesActivities: [] as SalesActivityRecord[],
};

export function calculateStudioTrialAndPaymentStatus(studio: StudioRecord) {
  const now = new Date();
  let trialStatus = studio.trialStatus || 'PENDING';
  let trialDaysRemaining = 7;
  let paymentStatus = studio.paymentStatus || 'PENDING';

  if (studio.status === 'pending') {
    trialStatus = 'PENDING';
    trialDaysRemaining = 7;
  } else if (studio.paymentStatus === 'PAYMENT_SUCCESS' || studio.trialStatus === 'CONVERTED' || studio.trialStatus === 'Converted/Paid') {
    trialStatus = 'CONVERTED';
    paymentStatus = 'PAYMENT_SUCCESS';
    trialDaysRemaining = 0;
  } else if (studio.trialEndDate) {
    const endDate = new Date(studio.trialEndDate);
    const diffMs = endDate.getTime() - now.getTime();
    trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    if (diffMs <= 0) {
      trialStatus = 'EXPIRED';
      if (paymentStatus === 'PENDING') {
        paymentStatus = 'PAYMENT_PENDING';
      }
    } else if (trialDaysRemaining <= 1) {
      trialStatus = 'EXPIRING_SOON';
    } else {
      trialStatus = 'ACTIVE';
    }
  }

  // Update record in memory if changed
  studio.trialStatus = trialStatus;
  studio.paymentStatus = paymentStatus;

  return {
    ...studio,
    trialStatus,
    paymentStatus,
    trialDaysRemaining,
  };
}

// ==========================================
// SEED DATA INITIALIZATION
// ==========================================

export function seedInitialData() {
  const now = new Date().toISOString();

  // 1. STUDIOS (6 Distinct Photography Studios)
  memoryStore.studios = [
    {
      id: 'studio_1',
      name: 'Studio Aurora',
      slug: 'studio-aurora',
      tagline: 'Artistic & Cinematic Wedding Storytellers',
      logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      email: 'priya@studioaurora.in',
      phone: '+91 98401 11223',
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
  const defaultHash = bcrypt.hashSync('123456789', 10);

  memoryStore.users = [
    {
      id: 'usr_super_admin',
      name: 'Rajesh Malhotra',
      email: 'master@greatmaster.io',
      role: 'great_master',
      phone: '+91 98000 00001',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      passwordHash: defaultHash,
      created_at: now,
    },
    {
      id: 'usr_studio_aurora',
      studioId: 'studio_1',
      name: 'Priya Sharma (Studio Aurora)',
      email: 'priya@studioaurora.in',
      role: 'studio_admin',
      phone: '+91 98401 11223',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      passwordHash: defaultHash,
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
      passwordHash: defaultHash,
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
      passwordHash: defaultHash,
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
      passwordHash: defaultHash,
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
      passwordHash: defaultHash,
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
      passwordHash: defaultHash,
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

  // 12. SALES PACKAGES
  memoryStore.packages = [
    {
      id: 'pkg_1',
      studioId: 'studio_1',
      name: 'Luxury Wedding & Reception Coverage',
      category: 'Wedding',
      description: 'Comprehensive royal coverage with candid masters, 4K cinema film, and luxury album.',
      price: 180000,
      duration: '2 Full Days (Wedding + Reception)',
      photographersCount: 4,
      editedPhotosCount: 350,
      album: '40-Page Velvet Flushmount Fine Art Album',
      video: '3-min 4K Teaser + 35-min Cinematic Feature Film',
      addons: ['Drone 4K Pilot', 'Live Streaming Setup', 'Same-Day Highlights Reel'],
      availability: 'Available for 2026-2027 Season',
      status: 'active',
    },
    {
      id: 'pkg_2',
      studioId: 'studio_1',
      name: 'Standard Wedding Story',
      category: 'Wedding',
      description: 'Classic ceremony & reception capture with portrait sessions and curated photo book.',
      price: 105000,
      duration: 'Full Day Coverage (14 Hours)',
      photographersCount: 3,
      editedPhotosCount: 250,
      album: '30-Page Leatherette Photobook',
      video: '4K Traditional Video + 5-min Highlight',
      addons: ['Drone Aerials', 'Pre-Wedding Mini Shoot'],
      availability: 'Available',
      status: 'active',
    },
    {
      id: 'pkg_3',
      studioId: 'studio_1',
      name: 'Cinematic Pre-Wedding Shoot',
      category: 'Pre-Wedding',
      description: 'Dreamy outdoor shoot with wardrobe styling, creative drone visuals, and romantic edits.',
      price: 45000,
      duration: 'Full Day (2 Locations)',
      photographersCount: 2,
      editedPhotosCount: 60,
      album: '20-Page Hardcover Memory Book',
      video: '2-min Cinematic Music Video & 3 Instagram Reels',
      addons: ['Smoke Bombs & Lighting Assist', 'MUA Coordination'],
      availability: 'Available',
      status: 'active',
    },
    {
      id: 'pkg_4',
      studioId: 'studio_1',
      name: 'Traditional Engagement & Roka',
      category: 'Event',
      description: 'Intimate family gathering & engagement rituals documented with warmth and elegance.',
      price: 35000,
      duration: '6 Hours',
      photographersCount: 2,
      editedPhotosCount: 120,
      album: 'Digital High-Res Gallery + 20-Page Mini Album',
      video: 'Edited Full Ritual Highlights',
      addons: ['Instant Print Booth', 'Frame Magnets'],
      availability: 'Available',
      status: 'active',
    },
    {
      id: 'pkg_5',
      studioId: 'studio_1',
      name: 'Editorial Portrait & Maternity',
      category: 'Portrait',
      description: 'Artistic fine-art maternity or studio portraiture with magazine-style retouching.',
      price: 25000,
      duration: '4 Hours (Studio / Outdoor)',
      photographersCount: 1,
      editedPhotosCount: 40,
      album: 'Printed 12x18 Fine Art Canvas Frame',
      video: 'Behind-the-Scenes Short Reel',
      addons: ['Wardrobe / Gown Rental', 'Hair Stylist'],
      availability: 'Available',
      status: 'active',
    },
    {
      id: 'pkg_6',
      studioId: 'studio_1',
      name: 'Commercial & Brand Event Summit',
      category: 'Commercial',
      description: 'Fast-turnaround high-impact photography for corporate galas, conferences, and launches.',
      price: 60000,
      duration: '8 Hours',
      photographersCount: 2,
      editedPhotosCount: 180,
      album: 'Cloud Media Press Kit',
      video: 'Social Media Cutdowns + Executive Interviews',
      addons: ['Same-Hour PR Delivery', 'Branded Watermarking'],
      availability: 'Available',
      status: 'active',
    },
  ];

  // 13. SALES LEADS
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  memoryStore.leads = [
    {
      id: 'lead_1',
      leadCode: 'LD-101',
      studioId: 'studio_1',
      clientName: 'Rohan Verma & Ananya Iyer',
      phone: '+91 98450 12345',
      email: 'rohan.ananya@gmail.com',
      eventType: 'Wedding',
      eventDate: '2026-11-20',
      location: 'Palace Grounds, Bangalore',
      source: 'Instagram',
      estimatedBudget: 180000,
      interestedPackage: 'Luxury Wedding & Reception Coverage',
      status: 'NEW',
      assignedSalesPerson: 'Priya Sharma',
      lastContacted: 'Today at 09:30 AM',
      nextFollowUp: todayStr,
      notes: 'Inquired via Instagram Ad. Looking for candid photographer and 4K cinema teaser. Grand South Indian wedding.',
      created_at: '2026-09-06T10:00:00Z',
    },
    {
      id: 'lead_2',
      leadCode: 'LD-102',
      studioId: 'studio_1',
      clientName: 'Siddharth & Meera Nair',
      phone: '+91 98860 54321',
      email: 'siddharth.nair@outlook.com',
      eventType: 'Pre-Wedding',
      eventDate: '2026-10-15',
      location: 'Nandi Hills / Cubbon Park, Bangalore',
      source: 'Website Referral',
      estimatedBudget: 45000,
      interestedPackage: 'Cinematic Pre-Wedding Shoot',
      status: 'CONTACTED',
      assignedSalesPerson: 'Arjun Reddy',
      lastContacted: 'Yesterday at 04:15 PM',
      nextFollowUp: todayStr,
      notes: 'Had introductory phone call. Couple wants sunrise hills concept with drone shots. Preparing proposal.',
      created_at: '2026-09-05T14:30:00Z',
    },
    {
      id: 'lead_3',
      leadCode: 'LD-103',
      studioId: 'studio_1',
      clientName: 'Vikramaditya Singhania',
      phone: '+91 99000 88776',
      email: 'vikram.singhania@corp.in',
      eventType: 'Wedding',
      eventDate: '2026-12-14',
      location: 'Umaid Bhawan Palace, Jodhpur',
      source: 'Client Referral',
      estimatedBudget: 250000,
      interestedPackage: 'Luxury Wedding & Reception Coverage',
      status: 'QUALIFIED',
      assignedSalesPerson: 'Priya Sharma',
      lastContacted: '2 days ago',
      nextFollowUp: tomorrowStr,
      notes: 'Destination luxury wedding. High budget potential. Client requested custom multi-day quote with drone crew.',
      created_at: '2026-09-04T11:00:00Z',
    },
    {
      id: 'lead_4',
      leadCode: 'LD-104',
      studioId: 'studio_1',
      clientName: 'Aditya Joshi & Pooja Sen',
      phone: '+91 97410 33445',
      email: 'aditya.pooja@gmail.com',
      eventType: 'Wedding',
      eventDate: '2027-01-08',
      location: 'Taj West End, Bangalore',
      source: 'Google Search',
      estimatedBudget: 120000,
      interestedPackage: 'Standard Wedding Story',
      status: 'QUOTATION_SENT',
      assignedSalesPerson: 'Rahul Mehta',
      lastContacted: 'Yesterday at 06:00 PM',
      nextFollowUp: tomorrowStr,
      notes: 'Quotation QUO-2026-001 sent for ₹1,08,000 (with 10% discount). Couple reviewing with family elders.',
      created_at: '2026-09-03T16:00:00Z',
    },
    {
      id: 'lead_5',
      leadCode: 'LD-105',
      studioId: 'studio_1',
      clientName: 'Karan Malhotra & Rhea Batra',
      phone: '+91 98402 77889',
      email: 'karan.malhotra@batra.com',
      eventType: 'Engagement',
      eventDate: '2026-10-22',
      location: 'JW Marriott, Bangalore',
      source: 'Walk-in',
      estimatedBudget: 40000,
      interestedPackage: 'Traditional Engagement & Roka',
      status: 'NEGOTIATION',
      assignedSalesPerson: 'Priya Sharma',
      lastContacted: 'Today at 11:00 AM',
      nextFollowUp: tomorrowStr,
      notes: 'Discussing album page upgrades. Offering complimentary mini teaser to close booking.',
      created_at: '2026-09-02T12:00:00Z',
    },
    {
      id: 'lead_6',
      leadCode: 'LD-106',
      studioId: 'studio_1',
      clientName: 'Sneha & Abhinav Kulkarni',
      phone: '+91 99801 22334',
      email: 'abhinav.sneha@gmail.com',
      eventType: 'Wedding',
      eventDate: '2026-11-28',
      location: 'Temple Tree Leisure, Bangalore',
      source: 'Instagram',
      estimatedBudget: 175000,
      interestedPackage: 'Luxury Wedding & Reception Coverage',
      status: 'CONVERTED',
      assignedSalesPerson: 'Arjun Reddy',
      lastContacted: '3 days ago',
      nextFollowUp: 'Completed',
      notes: 'Quotation QUO-2026-003 accepted. 30% advance received. Converted to Client & ready for Pre-Production.',
      created_at: '2026-08-28T09:00:00Z',
      convertedClientId: 'client_1',
      convertedProjectId: 'shoot_1',
    },
    {
      id: 'lead_7',
      leadCode: 'LD-107',
      studioId: 'studio_1',
      clientName: 'Raghav Bansal',
      phone: '+91 98409 66554',
      email: 'raghav.bansal@gmail.com',
      eventType: 'Event',
      eventDate: '2026-09-12',
      location: 'The Leela Palace, Bangalore',
      source: 'Website Referral',
      estimatedBudget: 25000,
      interestedPackage: 'Editorial Portrait & Maternity',
      status: 'LOST',
      assignedSalesPerson: 'Rahul Mehta',
      lastContacted: '4 days ago',
      nextFollowUp: 'N/A',
      notes: 'Client date overlapped with fully booked weekend. Referred to partner studio.',
      created_at: '2026-08-25T15:00:00Z',
    },
  ];

  // 14. SALES QUOTATIONS
  memoryStore.quotations = [
    {
      id: 'quo_1',
      quotationNumber: 'QUO-2026-001',
      studioId: 'studio_1',
      leadId: 'lead_4',
      clientName: 'Aditya Joshi & Pooja Sen',
      clientContact: '+91 97410 33445',
      clientEmail: 'aditya.pooja@gmail.com',
      eventType: 'Wedding',
      eventDate: '2027-01-08',
      location: 'Taj West End, Bangalore',
      packageId: 'pkg_2',
      packageName: 'Standard Wedding Story',
      packagePrice: 105000,
      addons: [{ name: 'Drone 4K Pilot', price: 15000 }],
      discountPercent: 10,
      discountAmount: 12000,
      taxAmount: 0,
      finalAmount: 108000,
      validUntil: '2026-10-05',
      notes: 'Includes full coverage of Sangeet and Wedding reception with complimentary 30-page album.',
      status: 'SENT',
      created_at: '2026-09-05T17:00:00Z',
      sentAt: '2026-09-05T17:15:00Z',
    },
    {
      id: 'quo_2',
      quotationNumber: 'QUO-2026-002',
      studioId: 'studio_1',
      leadId: 'lead_5',
      clientName: 'Karan Malhotra & Rhea Batra',
      clientContact: '+91 98402 77889',
      clientEmail: 'karan.malhotra@batra.com',
      eventType: 'Engagement',
      eventDate: '2026-10-22',
      location: 'JW Marriott, Bangalore',
      packageId: 'pkg_4',
      packageName: 'Traditional Engagement & Roka',
      packagePrice: 35000,
      addons: [{ name: 'Instant Print Booth', price: 8000 }],
      discountPercent: 0,
      discountAmount: 0,
      taxAmount: 0,
      finalAmount: 43000,
      validUntil: '2026-09-25',
      notes: 'Proposal sent with instant photo booth add-on for guests.',
      status: 'NEGOTIATION',
      created_at: '2026-09-04T12:30:00Z',
      sentAt: '2026-09-04T13:00:00Z',
    },
    {
      id: 'quo_3',
      quotationNumber: 'QUO-2026-003',
      studioId: 'studio_1',
      leadId: 'lead_6',
      clientName: 'Sneha & Abhinav Kulkarni',
      clientContact: '+91 99801 22334',
      clientEmail: 'abhinav.sneha@gmail.com',
      eventType: 'Wedding',
      eventDate: '2026-11-28',
      location: 'Temple Tree Leisure, Bangalore',
      packageId: 'pkg_1',
      packageName: 'Luxury Wedding & Reception Coverage',
      packagePrice: 180000,
      addons: [{ name: 'Drone 4K Pilot', price: 0 }],
      discountPercent: 5,
      discountAmount: 9000,
      taxAmount: 0,
      finalAmount: 171000,
      validUntil: '2026-09-15',
      notes: 'Accepted with 5% special early-bird booking privilege. Advance received.',
      status: 'ACCEPTED',
      created_at: '2026-08-30T10:00:00Z',
      sentAt: '2026-08-30T10:30:00Z',
      acceptedAt: '2026-09-03T15:00:00Z',
    },
    {
      id: 'quo_4',
      quotationNumber: 'QUO-2026-004',
      studioId: 'studio_1',
      leadId: 'lead_3',
      clientName: 'Vikramaditya Singhania',
      clientContact: '+91 99000 88776',
      clientEmail: 'vikram.singhania@corp.in',
      eventType: 'Wedding',
      eventDate: '2026-12-14',
      location: 'Umaid Bhawan Palace, Jodhpur',
      packageId: 'pkg_1',
      packageName: 'Luxury Wedding & Reception Coverage',
      packagePrice: 180000,
      addons: [
        { name: 'Same-Day Highlights Reel', price: 25000 },
        { name: 'Drone 4K Pilot', price: 15000 },
      ],
      discountPercent: 0,
      discountAmount: 0,
      taxAmount: 0,
      finalAmount: 220000,
      validUntil: '2026-10-15',
      notes: 'Custom destination wedding proposal under preparation for Jodhpur royal heritage shoot.',
      status: 'DRAFT',
      created_at: '2026-09-06T18:00:00Z',
    },
  ];

  // 15. SALES FOLLOW-UPS
  memoryStore.followUps = [
    {
      id: 'fup_1',
      studioId: 'studio_1',
      leadId: 'lead_1',
      clientName: 'Rohan Verma',
      contact: '+91 98450 12345',
      followUpDate: todayStr,
      followUpTime: '11:30 AM',
      contactMethod: 'Phone Call',
      status: 'PENDING',
      notes: 'Call groom to discuss wedding schedule and send portfolio film links via WhatsApp.',
      assignedPerson: 'Priya Sharma',
      created_at: '2026-09-06T10:15:00Z',
    },
    {
      id: 'fup_2',
      studioId: 'studio_1',
      leadId: 'lead_2',
      clientName: 'Siddharth Nair',
      contact: '+91 98860 54321',
      followUpDate: todayStr,
      followUpTime: '03:00 PM',
      contactMethod: 'WhatsApp',
      status: 'PENDING',
      notes: 'Send 3 sample pre-wedding location moodboards and drone shoot permissions breakdown.',
      assignedPerson: 'Arjun Reddy',
      created_at: '2026-09-05T14:45:00Z',
    },
    {
      id: 'fup_3',
      studioId: 'studio_1',
      leadId: 'lead_5',
      clientName: 'Karan Malhotra',
      contact: '+91 98402 77889',
      followUpDate: tomorrowStr,
      followUpTime: '04:30 PM',
      contactMethod: 'In-Person Meeting',
      status: 'PENDING',
      notes: 'In-person meeting at Indiranagar studio to review physical sample photo albums.',
      assignedPerson: 'Priya Sharma',
      created_at: '2026-09-04T16:00:00Z',
    },
    {
      id: 'fup_4',
      studioId: 'studio_1',
      leadId: 'lead_6',
      clientName: 'Sneha Kulkarni',
      contact: '+91 99801 22334',
      followUpDate: yesterdayStr,
      followUpTime: '02:00 PM',
      contactMethod: 'Phone Call',
      status: 'COMPLETED',
      notes: 'Confirmed booking advance receipt and introduced Pre-Production coordinator.',
      assignedPerson: 'Arjun Reddy',
      created_at: '2026-09-03T11:00:00Z',
    },
  ];

  // 16. SALES ACTIVITIES (AUDIT TRAIL)
  memoryStore.salesActivities = [
    {
      id: 'sact_1',
      studioId: 'studio_1',
      type: 'lead_created',
      title: 'New Lead: Rohan Verma & Ananya Iyer',
      details: 'Inquiry received via Instagram for Palace Grounds Wedding (Est. ₹1,80,000).',
      leadId: 'lead_1',
      actor: 'System / Ad Campaign',
      timestamp: '2 hours ago',
    },
    {
      id: 'sact_2',
      studioId: 'studio_1',
      type: 'followup_scheduled',
      title: 'Follow-up Scheduled: Siddharth Nair',
      details: 'WhatsApp call scheduled for 03:00 PM to review moodboard options.',
      leadId: 'lead_2',
      actor: 'Arjun Reddy',
      timestamp: '4 hours ago',
    },
    {
      id: 'sact_3',
      studioId: 'studio_1',
      type: 'quotation_sent',
      title: 'Quotation QUO-2026-001 Sent',
      details: 'Sent Standard Wedding Story quote (₹1,08,000) to Aditya Joshi & Pooja Sen.',
      quotationId: 'quo_1',
      leadId: 'lead_4',
      actor: 'Rahul Mehta',
      timestamp: 'Yesterday',
    },
    {
      id: 'sact_4',
      studioId: 'studio_1',
      type: 'quotation_accepted',
      title: 'Quotation QUO-2026-003 Accepted',
      details: 'Sneha & Abhinav Kulkarni approved Luxury Wedding package for ₹1,71,000.',
      quotationId: 'quo_3',
      leadId: 'lead_6',
      actor: 'Sneha Kulkarni (Client)',
      timestamp: '3 days ago',
    },
    {
      id: 'sact_5',
      studioId: 'studio_1',
      type: 'client_converted',
      title: 'Lead Converted to Client',
      details: 'Created client record and initiated Shoot Project for Temple Tree Leisure.',
      clientId: 'client_1',
      leadId: 'lead_6',
      actor: 'Arjun Reddy',
      timestamp: '3 days ago',
    },
    {
      id: 'sact_6',
      studioId: 'studio_1',
      type: 'moved_to_preproduction',
      title: 'Project Moved to Pre-Production',
      details: 'Transferred project to CRM workflow for photographer assignment and moodboard planning.',
      projectId: 'shoot_1',
      clientId: 'client_1',
      actor: 'Priya Sharma (Sales Lead)',
      timestamp: '3 days ago',
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
