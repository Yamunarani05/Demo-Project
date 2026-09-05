import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { memoryStore, UserRecord } from '../db';
import { sendRegistrationEmail } from '../services/emailService';

const router = Router();

// Demo Personas for Quick Switch
const DEMO_PERSONAS = [
  {
    role: 'super_admin',
    name: 'Rajesh Malhotra',
    label: 'Great Master (Platform Owner)',
    email: 'master@greatmaster.io',
    description: 'Monitor all studios, live shoot radar, platform metrics',
  },
  {
    role: 'studio_admin',
    studioId: 'studio_1',
    name: 'Vikram Sundaram',
    label: 'Dream Frames Studio (Admin)',
    email: 'admin@dreamframes.in',
    description: 'Manage Dream Frames: 12 active shoots, 4 photographers, CRM',
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
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Please enter your email' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Please enter your password' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Find user by email in memoryStore
  const user = memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !user.passwordHash) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Find associated studio if studioId exists
    const studio = user.studioId ? memoryStore.studios.find(s => s.id === user?.studioId) : null;
    const client = user.clientId ? memoryStore.clients.find(c => c.id === user?.clientId) : null;

    if (user.role === 'studio_admin' && studio) {
      if (studio.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your studio access request is awaiting approval from the Great Master Admin. Please check your registered email for updates.',
        });
      }
      if (studio.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your studio access request was not approved. Please check your registered email for more information.',
        });
      }
    }

    // Do not return passwordHash
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      success: true,
      token: `token_${user.id}_${Date.now()}`,
      user: safeUser,
      studio,
      client,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Authentication failed. Please try again.' });
  }
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

// POST /api/auth/register-studio - Customer-Facing Studio Registration
router.post('/register-studio', async (req: Request, res: Response) => {
  const {
    studioName,
    adminName,
    email,
    phone,
    password,
    address,
    city,
    state,
    totalEmployees,
    photographers,
    editors,
    referenceEmail,
  } = req.body;

  if (!studioName || !studioName.trim()) {
    return res.status(400).json({ success: false, message: 'Studio name is required' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'An account with this email address already exists' });
  }

  try {
    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const studioId = `studio_${Date.now()}`;
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const newStudio: any = {
      id: studioId,
      name: studioName.trim(),
      slug: studioName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tagline: 'Professional Photography & Cinematic Storytelling',
      logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      email: normalizedEmail,
      referenceEmail: referenceEmail || undefined,
      phone: phone || '+91 98000 00000',
      address: address || '',
      city: city || 'Bangalore',
      state: state || 'Karnataka',
      status: 'pending',
      plan: 'Studio Pro (Trial)',
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString(),
      trialStatus: 'Pending Approval',
      activeShootsCount: 0,
      completedShootsCount: 0,
      totalRevenue: 0,
      totalEmployees: totalEmployees ? Number(totalEmployees) : 1,
      photographersCount: photographers ? Number(photographers) : 1,
      editorsCount: editors ? Number(editors) : 1,
      created_at: now.toISOString(),
    };

    const newUser: UserRecord = {
      id: `usr_${Date.now()}`,
      studioId,
      name: adminName || `${studioName} Admin`,
      email: normalizedEmail,
      phone: phone || '+91 98000 00000',
      role: 'studio_admin',
      passwordHash,
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
      action: 'Studio Access Requested',
      details: `${newStudio.name} submitted access request (Pending Approval).`,
      timestamp: 'Just now',
    });

    // Send Registration Success Email Notification
    let emailResult: any = { success: false, emailSent: false };
    try {
      emailResult = await sendRegistrationEmail({
        adminName: newUser.name,
        studioName: newStudio.name,
        adminEmail: normalizedEmail,
        referenceEmail: referenceEmail || undefined,
        city: newStudio.city,
      });
    } catch (e) {
      console.error(`[Email] Failed to send registration email to ${normalizedEmail}`);
    }

    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      pending: true,
      emailSent: emailResult.emailSent,
      data: {
        user: safeUser,
        studio: newStudio,
      },
      user: safeUser,
      studio: newStudio,
      message: `Studio access request submitted successfully. Confirmation email ${emailResult.emailSent ? 'sent' : 'queued'} to ${normalizedEmail}.`,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

export default router;
