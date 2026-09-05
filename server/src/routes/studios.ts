import { Router, Request, Response } from 'express';
import { memoryStore, StudioRecord } from '../db';

const router = Router();

// GET /api/studios - Super Admin lists all studios
router.get('/', (req: Request, res: Response) => {
  const { status, search } = req.query;

  let studios = [...memoryStore.studios];

  if (status && status !== 'all') {
    studios = studios.filter(s => s.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    studios = studios.filter(
      s => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.state.toLowerCase().includes(q)
    );
  }

  // Update counts dynamically
  studios = studios.map(s => {
    const studioShoots = memoryStore.shoots.filter(sh => sh.studioId === s.id);
    const activeShoots = studioShoots.filter(sh => sh.status !== 'COMPLETED' && sh.status !== 'CANCELLED').length;
    const completedShoots = studioShoots.filter(sh => sh.status === 'COMPLETED').length;
    const revenue = studioShoots.reduce((acc, sh) => acc + (sh.paidAmount || 0), 0);

    return {
      ...s,
      activeShootsCount: activeShoots || s.activeShootsCount,
      completedShootsCount: completedShoots || s.completedShootsCount,
      totalRevenue: revenue || s.totalRevenue,
    };
  });

  res.json({
    success: true,
    data: studios,
    total: studios.length,
  });
});

// GET /api/studios/:id - Get single studio detail
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const studio = memoryStore.studios.find(s => s.id === id);

  if (!studio) {
    return res.status(404).json({ success: false, message: 'Studio not found' });
  }

  const studioShoots = memoryStore.shoots.filter(s => s.studioId === id);
  const studioPhotographers = memoryStore.photographers.filter(p => p.studioId === id);
  const studioClients = memoryStore.clients.filter(c => c.studioId === id);
  const studioAdmin = memoryStore.users.find(u => u.role === 'studio_admin' && u.studioId === id);
  const studioActivity = memoryStore.activityLogs.filter(a => a.studioId === id);

  res.json({
    success: true,
    data: {
      ...studio,
      admin: {
        id: studioAdmin?.id || `usr_${studio.id}`,
        name: studioAdmin?.name || `${studio.name} Admin`,
        email: studioAdmin?.email || studio.email,
        phone: studioAdmin?.phone || studio.phone,
        role: 'studio_admin',
      },
      shoots: studioShoots,
      photographers: studioPhotographers,
      clients: studioClients,
      activity: studioActivity,
      metrics: {
        totalShoots: studioShoots.length,
        activeShoots: studioShoots.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length,
        completedShoots: studioShoots.filter(s => s.status === 'COMPLETED').length,
        totalClients: studioClients.length,
        totalPhotographers: studioPhotographers.length,
        totalRevenue: studioShoots.reduce((sum, sh) => sum + (sh.paidAmount || 0), 0) || studio.totalRevenue,
      },
    },
  });
});

// POST /api/studios - Create new studio
router.post('/', (req: Request, res: Response) => {
  const { name, tagline, email, phone, city, state, plan } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Studio name and email are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newStudio: StudioRecord = {
    id: `studio_${Date.now()}`,
    name,
    slug,
    tagline: tagline || 'Professional Photography & Cinematic Storytelling',
    logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
    email,
    phone: phone || '+91 90000 00000',
    city: city || 'Bangalore',
    state: state || 'Karnataka',
    status: 'active',
    plan: plan || 'Studio Pro',
    activeShootsCount: 0,
    completedShootsCount: 0,
    totalRevenue: 0,
    created_at: new Date().toISOString(),
  };

  memoryStore.studios.push(newStudio);

  // Add activity log
  memoryStore.activityLogs.unshift({
    id: `act_${Date.now()}`,
    studioId: newStudio.id,
    actorName: 'Super Admin',
    actorRole: 'Platform Owner',
    action: 'Created New Studio',
    details: `Onboarded studio: ${newStudio.name} in ${newStudio.city}`,
    timestamp: 'Just now',
  });

  res.status(201).json({
    success: true,
    data: newStudio,
    message: 'Studio registered successfully',
  });
});

// PUT /api/studios/:id/status - Update studio access request status (active/approved/rejected/pending)
router.put('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const studio = memoryStore.studios.find(s => s.id === id);
  if (!studio) {
    return res.status(404).json({ success: false, message: 'Studio not found' });
  }

  studio.status = status;
  const studioAdmin = memoryStore.users.find(u => u.role === 'studio_admin' && u.studioId === id);
  const adminName = studioAdmin?.name || studio.name;
  const adminEmail = studioAdmin?.email || studio.email;

  memoryStore.activityLogs.unshift({
    id: `act_${Date.now()}`,
    studioId: studio.id,
    actorName: 'Super Admin',
    actorRole: 'Platform Owner',
    action: `Studio Access Request ${status === 'active' || status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}`,
    details: `Studio ${studio.name} status set to ${status}`,
    timestamp: 'Just now',
  });

  let emailResult = { success: false, emailSent: false, message: '' };

  const emailData = {
    adminName,
    studioName: studio.name,
    adminEmail,
    referenceEmail: (studio as any).referenceEmail,
    reason,
  };

  if (status === 'active' || status === 'approved') {
    const { sendApprovalEmail } = await import('../services/emailService');
    emailResult = await sendApprovalEmail(emailData);
  } else if (status === 'rejected') {
    const { sendRejectionEmail } = await import('../services/emailService');
    emailResult = await sendRejectionEmail(emailData);
  }

  res.json({
    success: true,
    data: studio,
    emailSent: emailResult.emailSent,
    message: emailResult.emailSent
      ? `Studio status updated to ${status}. Notification email sent to ${adminEmail}.`
      : `Studio status updated to ${status}. However, the notification email could not be sent.`,
  });
});

export default router;
