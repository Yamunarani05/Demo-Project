import { Router, Request, Response } from 'express';
import { memoryStore, UserRecord } from '../db';

const router = Router();

// Demo Personas for Quick Switch
const DEMO_PERSONAS = [
  {
    role: 'super_admin',
    name: 'Rajesh Malhotra',
    label: 'Great Master (Platform Owner)',
    email: 'master@greatmaster.io',
    description: 'Monitor all 6 studios, live shoot radar, platform metrics',
  },
  {
    role: 'studio_admin',
    studioId: 'studio_1',
    name: 'Vikram Sundaram',
    label: 'Dream Frames Studio (Admin)',
    email: 'admin@dreamframes.in',
    description: 'Manage Dream Frames: 12 active shoots, 4 photographers, CRM',
  },
  {
    role: 'studio_admin',
    studioId: 'studio_2',
    name: 'Aakash Mehta',
    label: 'Pixel Stories Productions (Admin)',
    email: 'admin@pixelstories.in',
    description: 'Manage Pixel Stories: Goa & Mumbai destination weddings',
  },
  {
    role: 'studio_admin',
    studioId: 'studio_3',
    name: 'Prasad Reddy',
    label: 'Lens Studio & Co. (Admin)',
    email: 'connect@lensstudio.co',
    description: 'Manage Lens Studio: 15 active South Indian weddings',
  },
  {
    role: 'client',
    studioId: 'studio_1',
    clientId: 'client_1',
    name: 'Arun & Priya',
    label: 'Couple Client (Arun & Priya)',
    email: 'arun.priya@gmail.com',
    description: 'Pre-Wedding in Ooty: Live timeline, photo selection gallery',
  },
  {
    role: 'client',
    studioId: 'studio_2',
    clientId: 'client_6',
    name: 'Rahul & Meena',
    label: 'Couple Client (Rahul & Meena)',
    email: 'rahul.meena@gmail.com',
    description: 'Goa Beach Wedding: 3-day luxury celebration portal',
  },
  {
    role: 'photographer',
    studioId: 'studio_1',
    photographerId: 'photo_1',
    name: 'Karthik Rajan',
    label: 'Lead Photographer (Karthik)',
    email: 'karthik@dreamframes.in',
    description: 'Assigned shoots, shoot schedule, photo uploads',
  },
];

// GET /api/auth/personas
router.get('/personas', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: DEMO_PERSONAS,
  });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, role, studioId, clientId, photographerId } = req.body;

  // Check if persona match or fallback to default user
  let user = memoryStore.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user && role) {
    user = memoryStore.users.find(u => u.role === role);
  }

  if (!user) {
    // Dynamic login creation
    user = {
      id: `usr_${Date.now()}`,
      studioId: studioId || 'studio_1',
      clientId,
      photographerId,
      name: email ? email.split('@')[0] : 'Demo User',
      email: email || 'demo@greatmaster.io',
      role: (role as any) || 'studio_admin',
      created_at: new Date().toISOString(),
    };
    memoryStore.users.push(user);
  }

  // Find associated studio if studioId exists
  const studio = user.studioId ? memoryStore.studios.find(s => s.id === user?.studioId) : null;
  const client = user.clientId ? memoryStore.clients.find(c => c.id === user?.clientId) : null;

  res.json({
    success: true,
    token: `token_${user.id}_${Date.now()}`,
    user,
    studio,
    client,
  });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const role = (req.query.role as string) || 'super_admin';
  const studioId = (req.query.studioId as string) || 'studio_1';
  const clientId = (req.query.clientId as string) || 'client_1';

  let user = memoryStore.users.find(u => u.role === role);
  if (role === 'studio_admin' && studioId) {
    user = memoryStore.users.find(u => u.role === 'studio_admin' && u.studioId === studioId) || user;
  }
  if (role === 'client' && clientId) {
    user = memoryStore.users.find(u => u.role === 'client' && u.clientId === clientId) || user;
  }

  const studio = user?.studioId ? memoryStore.studios.find(s => s.id === user?.studioId) : null;
  const client = user?.clientId ? memoryStore.clients.find(c => c.id === user?.clientId) : null;

  res.json({
    success: true,
    user: user || memoryStore.users[0],
    studio,
    client,
  });
});

// POST /api/auth/register-studio - Customer-Facing Studio Free Trial Registration
router.post('/register-studio', (req: Request, res: Response) => {
  const { studioName, adminName, email, phone, password } = req.body;

  if (!studioName || !email) {
    return res.status(400).json({ success: false, message: 'Studio name and email are required' });
  }

  const studioId = `studio_${Date.now()}`;
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const newStudio: any = {
    id: studioId,
    name: studioName,
    slug: studioName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    tagline: 'Professional Photography & Cinematic Storytelling',
    logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
    email,
    phone: phone || '+91 98000 00000',
    city: 'Bangalore',
    state: 'Karnataka',
    status: 'active',
    plan: 'Studio Pro (Trial)',
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    trialStatus: 'Active Trial',
    activeShootsCount: 0,
    completedShootsCount: 0,
    totalRevenue: 0,
    created_at: now.toISOString(),
  };

  const newUser: UserRecord = {
    id: `usr_${Date.now()}`,
    studioId,
    name: adminName || `${studioName} Admin`,
    email,
    phone: phone || '+91 98000 00000',
    role: 'studio_admin',
    created_at: now.toISOString(),
  };

  memoryStore.studios.unshift(newStudio);
  memoryStore.users.push(newUser);

  // Add real-time activity log for Great Master monitoring
  memoryStore.activityLogs.unshift({
    id: `act_${Date.now()}`,
    studioId,
    actorName: newUser.name,
    actorRole: 'Studio Admin',
    action: 'Studio Registered & Trial Started',
    details: `${newStudio.name} registered for 14-Day Free Trial`,
    timestamp: 'Just now',
  });

  res.status(201).json({
    success: true,
    data: {
      user: newUser,
      studio: newStudio,
      token: `jwt_token_${newUser.id}`,
    },
    message: 'Studio registered successfully with 14-day free trial',
  });
});

export default router;
