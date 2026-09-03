import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';

const router = Router();

// GET /api/dashboard/super-admin - Great Master Central Command Center
router.get('/super-admin', (req: Request, res: Response) => {
  const studios = memoryStore.studios;
  const shoots = memoryStore.shoots;
  const clients = memoryStore.clients;
  const photographers = memoryStore.photographers;
  const activityLogs = memoryStore.activityLogs;

  const totalStudios = studios.length;
  const activeStudios = studios.filter(s => s.status === 'active').length;
  const totalClients = clients.length;
  const activeShoots = shoots.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length;
  const upcomingShoots = shoots.filter(s => s.status === 'CONFIRMED' || s.status === 'PLANNED' || s.status === 'PHOTOGRAPHER_ASSIGNED').length;
  const completedProjects = shoots.filter(s => s.status === 'COMPLETED').length;
  const pendingDeliveries = shoots.filter(s => s.status === 'DELIVERY' || s.status === 'CLIENT_APPROVED').length;
  const totalRevenue = shoots.reduce((acc, s) => acc + (s.paidAmount || 0), 0);

  // Studio Performance Table
  const studioPerformance = studios.map(s => {
    const sShoots = shoots.filter(sh => sh.studioId === s.id);
    const active = sShoots.filter(sh => sh.status !== 'COMPLETED' && sh.status !== 'CANCELLED').length;
    const completed = sShoots.filter(sh => sh.status === 'COMPLETED').length;
    const revenue = sShoots.reduce((acc, sh) => acc + (sh.paidAmount || 0), 0);
    const clientsCount = clients.filter(c => c.studioId === s.id).length;
    const teamCount = photographers.filter(p => p.studioId === s.id).length;

    return {
      id: s.id,
      name: s.name,
      city: s.city,
      plan: s.plan,
      status: s.status,
      activeShoots: active,
      completedShoots: completed,
      totalRevenue: revenue,
      clientsCount,
      teamCount,
    };
  });

  // Live Shoot Monitoring Radar
  const liveShoots = shoots.map(s => {
    const studio = studios.find(st => st.id === s.studioId);
    const client = clients.find(c => c.id === s.clientId);
    return {
      id: s.id,
      title: s.title,
      studioId: s.studioId,
      studioName: studio?.name || 'Studio',
      clientName: client?.coupleName || client?.name || 'Client',
      type: s.type,
      status: s.status,
      progressPercent: s.progressPercent,
      location: s.location,
      shootDate: s.shootDate,
      photographerName: s.photographerName || 'Unassigned',
      photoCount: s.photoCount,
      selectedPhotoCount: s.selectedPhotoCount,
      editedPhotoCount: s.editedPhotoCount,
    };
  });

  // Shoot Types distribution
  const shootTypeCounts: Record<string, number> = {};
  shoots.forEach(s => {
    shootTypeCounts[s.type] = (shootTypeCounts[s.type] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      metrics: {
        totalStudios,
        activeStudios,
        totalClients,
        activeShoots,
        upcomingShoots,
        completedProjects,
        pendingDeliveries,
        totalRevenue,
      },
      studioPerformance,
      liveShoots,
      shootTypeCounts,
      recentActivity: activityLogs.slice(0, 10),
    },
  });
});

// GET /api/dashboard/studio/:id - Studio Admin Workspace Dashboard
router.get('/studio/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const studio = memoryStore.studios.find(s => s.id === id);

  if (!studio) {
    return res.status(404).json({ success: false, message: 'Studio not found' });
  }

  const studioShoots = memoryStore.shoots.filter(s => s.studioId === id);
  const studioClients = memoryStore.clients.filter(c => c.studioId === id);
  const studioPhotographers = memoryStore.photographers.filter(p => p.studioId === id);
  const studioPayments = memoryStore.payments.filter(p => p.studioId === id);
  const studioActivityLogs = memoryStore.activityLogs.filter(a => a.studioId === id);

  const activeShoots = studioShoots.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED');
  const upcomingShoots = studioShoots.filter(
    s => s.status === 'CONFIRMED' || s.status === 'PLANNED' || s.status === 'PHOTOGRAPHER_ASSIGNED'
  );
  const completedShoots = studioShoots.filter(s => s.status === 'COMPLETED');
  const pendingDeliveries = studioShoots.filter(
    s => s.status === 'DELIVERY' || s.status === 'CLIENT_APPROVED' || s.status === 'INTERNAL_REVIEW'
  );
  const totalRevenue = studioPayments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
  const pendingRevenue = studioPayments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);

  // Workflow pipeline breakdown
  const pipelineCounts: Record<string, number> = {};
  studioShoots.forEach(s => {
    pipelineCounts[s.status] = (pipelineCounts[s.status] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      studio,
      metrics: {
        totalClients: studioClients.length,
        activeShootsCount: activeShoots.length,
        upcomingShootsCount: upcomingShoots.length,
        completedShootsCount: completedShoots.length,
        pendingDeliveriesCount: pendingDeliveries.length,
        photographersCount: studioPhotographers.length,
        totalRevenue,
        pendingRevenue,
      },
      activeShoots: activeShoots.slice(0, 8),
      upcomingShoots: upcomingShoots.slice(0, 5),
      photographers: studioPhotographers,
      pipelineCounts,
      recentActivity: studioActivityLogs.slice(0, 8),
    },
  });
});

// GET /api/dashboard/client/:clientId - Client Portal Personal Dashboard
router.get('/client/:clientId', (req: Request, res: Response) => {
  const { clientId } = req.params;
  const client = memoryStore.clients.find(c => c.id === clientId);

  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  const studio = memoryStore.studios.find(s => s.id === client.studioId);
  const shoots = memoryStore.shoots.filter(s => s.clientId === clientId);
  const activeShoot = shoots.find(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED') || shoots[0];
  const photos = activeShoot ? memoryStore.photos.filter(p => p.shootId === activeShoot.id) : [];
  const deliverables = activeShoot ? memoryStore.deliverables.filter(d => d.shootId === activeShoot.id) : [];
  const photographer = activeShoot?.photographerId
    ? memoryStore.photographers.find(p => p.id === activeShoot.photographerId)
    : null;
  const cinematographer = activeShoot?.cinematographerId
    ? memoryStore.photographers.find(p => p.id === activeShoot.cinematographerId)
    : null;

  res.json({
    success: true,
    data: {
      client,
      studio,
      activeShoot,
      photographer,
      cinematographer,
      photosSummary: {
        total: photos.length,
        favorites: photos.filter(p => p.isFavorite).length,
        selected: photos.filter(p => p.isSelected).length,
        edited: photos.filter(p => p.isEdited).length,
      },
      deliverables,
      allShoots: shoots,
    },
  });
});

export default router;
