import { Router, Request, Response } from 'express';
import { memoryStore, ShootRecord, ShootStatus } from '../db';

const router = Router();

// Ordered 14-Stage Workflow sequence with progress percentage mapping
export const WORKFLOW_STAGES: { status: ShootStatus; label: string; progress: number; description: string }[] = [
  { status: 'LEAD', label: 'Lead', progress: 5, description: 'Initial inquiry received and requirement discussion.' },
  { status: 'CONFIRMED', label: 'Client Confirmed', progress: 15, description: 'Client confirmed package and paid initial booking advance.' },
  { status: 'PLANNED', label: 'Shoot Planned', progress: 25, description: 'Shoot locations, moodboard, outfits, and schedule finalized.' },
  { status: 'PHOTOGRAPHER_ASSIGNED', label: 'Photographer Assigned', progress: 35, description: 'Primary photographer, cinematographer & crew allocated.' },
  { status: 'SHOOTING', label: 'Shoot In Progress', progress: 45, description: 'On-location shoot currently underway.' },
  { status: 'SHOOT_COMPLETED', label: 'Shoot Completed', progress: 55, description: 'Shoot finished, RAW data backed up to cloud & local storage.' },
  { status: 'UPLOADED', label: 'Photos Uploaded', progress: 65, description: 'High-res gallery generated and shared with client.' },
  { status: 'SELECTION', label: 'Photo Selection', progress: 72, description: 'Client is shortlisting their favorite photos for editing.' },
  { status: 'EDITING', label: 'Editing & Retouching', progress: 80, description: 'Color grading, fine skin retouching, and cinematic cut.' },
  { status: 'INTERNAL_REVIEW', label: 'Internal Review', progress: 86, description: 'Studio creative director QC validation and toning checks.' },
  { status: 'CLIENT_REVIEW', label: 'Client Review', progress: 92, description: 'Dispatched to client portal for approval and review.' },
  { status: 'CLIENT_APPROVED', label: 'Client Approved', progress: 96, description: 'Client approved edited photos and album layout.' },
  { status: 'DELIVERY', label: 'Final Delivery', progress: 98, description: 'Handcrafted album dispatched and 4K download links generated.' },
  { status: 'COMPLETED', label: 'Completed', progress: 100, description: 'All physical deliverables received and project archived.' },
];

// GET /api/shoots - Multi-tenant filtered shoots
router.get('/', (req: Request, res: Response) => {
  const { studioId, status, type, photographerId, search } = req.query;

  let shoots = [...memoryStore.shoots];

  if (studioId && studioId !== 'all') {
    shoots = shoots.filter(s => s.studioId === studioId);
  }

  if (status && status !== 'all') {
    shoots = shoots.filter(s => s.status === status);
  }

  if (type && type !== 'all') {
    shoots = shoots.filter(s => s.type === type);
  }

  if (photographerId && photographerId !== 'all') {
    shoots = shoots.filter(s => s.photographerId === photographerId);
  }

  if (search) {
    const q = String(search).toLowerCase();
    shoots = shoots.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        (s.photographerName && s.photographerName.toLowerCase().includes(q))
    );
  }

  // Populate client & studio info
  const populated = shoots.map(shoot => {
    const client = memoryStore.clients.find(c => c.id === shoot.clientId);
    const studio = memoryStore.studios.find(s => s.id === shoot.studioId);
    return {
      ...shoot,
      client,
      studioName: studio?.name || 'Photography Studio',
    };
  });

  res.json({
    success: true,
    data: populated,
    total: populated.length,
  });
});

// GET /api/shoots/:id - Full Project / Shoot Detail Page
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const shoot = memoryStore.shoots.find(s => s.id === id);

  if (!shoot) {
    return res.status(404).json({ success: false, message: 'Shoot not found' });
  }

  const client = memoryStore.clients.find(c => c.id === shoot.clientId);
  const studio = memoryStore.studios.find(s => s.id === shoot.studioId);
  const photographer = shoot.photographerId
    ? memoryStore.photographers.find(p => p.id === shoot.photographerId)
    : null;
  const photos = memoryStore.photos.filter(p => p.shootId === shoot.id);
  const deliverables = memoryStore.deliverables.filter(d => d.shootId === shoot.id);
  const payments = memoryStore.payments.filter(p => p.shootId === shoot.id);
  const activityLogs = memoryStore.activityLogs.filter(a => a.shootId === shoot.id || a.studioId === shoot.studioId);

  res.json({
    success: true,
    data: {
      ...shoot,
      client,
      studio,
      photographer,
      photos,
      deliverables,
      payments,
      activityLogs: activityLogs.slice(0, 10),
      workflowStages: WORKFLOW_STAGES,
    },
  });
});

// POST /api/shoots - Create new shoot
router.post('/', (req: Request, res: Response) => {
  const {
    studioId,
    clientId,
    title,
    type,
    shootDate,
    location,
    theme,
    photographerId,
    cinematographerId,
    dronePilot,
    makeupArtist,
    costumeNotes,
    locationsCount,
    packageAmount,
    notes,
    deliverablesSummary,
  } = req.body;

  if (!studioId || !clientId || !shootDate) {
    return res.status(400).json({ success: false, message: 'studioId, clientId, and shootDate are required' });
  }

  const photographer = photographerId
    ? memoryStore.photographers.find(p => p.id === photographerId)
    : null;
  const cinematographer = cinematographerId
    ? memoryStore.photographers.find(p => p.id === cinematographerId)
    : null;
  const client = memoryStore.clients.find(c => c.id === clientId);

  const initialStatus: ShootStatus = photographerId ? 'PHOTOGRAPHER_ASSIGNED' : 'CONFIRMED';
  const stageInfo = WORKFLOW_STAGES.find(s => s.status === initialStatus) || WORKFLOW_STAGES[0];

  const newShoot: ShootRecord = {
    id: `shoot_${Date.now()}`,
    studioId,
    clientId,
    title: title || `${client?.coupleName || 'Couple'} — ${type || 'Pre-Wedding'} Shoot`,
    type: type || 'Pre-Wedding',
    shootDate,
    location: location || client?.location || 'Outdoor Location',
    theme: theme || 'Romantic & Cinematic',
    photographerId,
    photographerName: photographer?.name,
    cinematographerId,
    cinematographerName: cinematographer?.name,
    dronePilot,
    makeupArtist,
    costumeNotes,
    locationsCount: Number(locationsCount) || 1,
    status: initialStatus,
    progressPercent: stageInfo.progress,
    photoCount: 0,
    selectedPhotoCount: 0,
    editedPhotoCount: 0,
    packageAmount: Number(packageAmount) || client?.budget || 150000,
    paidAmount: 0,
    notes,
    deliverablesSummary,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryStore.shoots.unshift(newShoot);

  // Update client activeShootId
  if (client) {
    client.activeShootId = newShoot.id;
  }

  // Update photographer count if assigned
  if (photographer) {
    photographer.assignedShootsCount += 1;
  }

  // Notifications & Activity log
  memoryStore.activityLogs.unshift({
    id: `act_${Date.now()}`,
    studioId,
    shootId: newShoot.id,
    actorName: 'Studio Admin',
    actorRole: 'Studio Admin',
    action: `Created Project: ${newShoot.title}`,
    details: `Shoot scheduled for ${newShoot.shootDate} at ${newShoot.location}`,
    timestamp: 'Just now',
  });

  res.status(201).json({
    success: true,
    data: newShoot,
    message: 'Shoot created successfully',
  });
});

// PUT /api/shoots/:id/status - ADVANCE OR CHANGE WORKFLOW STATUS
router.put('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes, actorName, actorRole } = req.body;

  const shootIndex = memoryStore.shoots.findIndex(s => s.id === id);
  if (shootIndex === -1) {
    return res.status(404).json({ success: false, message: 'Shoot not found' });
  }

  const shoot = memoryStore.shoots[shootIndex];
  const previousStatus = shoot.status;
  const newStatus = status as ShootStatus;

  const stageInfo = WORKFLOW_STAGES.find(s => s.status === newStatus);
  if (!stageInfo) {
    return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
  }

  shoot.status = newStatus;
  shoot.progressPercent = stageInfo.progress;
  shoot.updated_at = new Date().toISOString();
  if (notes) shoot.notes = notes;

  // Specific milestone triggers
  if (newStatus === 'SHOOT_COMPLETED' && shoot.photoCount === 0) {
    shoot.photoCount = 850; // default simulation count
  }
  if (newStatus === 'UPLOADED' && shoot.photoCount === 0) {
    shoot.photoCount = 850;
  }
  if (newStatus === 'SELECTION' && shoot.selectedPhotoCount === 0) {
    shoot.selectedPhotoCount = 120;
  }
  if (newStatus === 'EDITING' && shoot.editedPhotoCount === 0) {
    shoot.editedPhotoCount = Math.round((shoot.selectedPhotoCount || 120) * 0.5);
  }
  if (newStatus === 'CLIENT_APPROVED' || newStatus === 'DELIVERY' || newStatus === 'COMPLETED') {
    shoot.editedPhotoCount = shoot.selectedPhotoCount || 120;
  }

  // Create Activity Log
  memoryStore.activityLogs.unshift({
    id: `act_${Date.now()}`,
    studioId: shoot.studioId,
    shootId: shoot.id,
    actorName: actorName || 'Studio Admin',
    actorRole: actorRole || 'Studio Admin',
    action: `Workflow Advanced: ${stageInfo.label}`,
    details: `Transitioned from ${previousStatus} to ${newStatus}. ${stageInfo.description}`,
    timestamp: 'Just now',
  });

  // Create Notification
  memoryStore.notifications.unshift({
    id: `notif_${Date.now()}`,
    studioId: shoot.studioId,
    recipientRole: 'client',
    title: `Project Update: ${stageInfo.label}`,
    message: `${shoot.title} is now in ${stageInfo.label} stage.`,
    type: 'info',
    isRead: false,
    link: `/client/project/${shoot.id}`,
    created_at: 'Just now',
  });

  res.json({
    success: true,
    data: shoot,
    message: `Project workflow advanced to ${stageInfo.label}`,
  });
});

// PUT /api/shoots/:id - Generic Shoot details update
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const shootIndex = memoryStore.shoots.findIndex(s => s.id === id);

  if (shootIndex === -1) {
    return res.status(404).json({ success: false, message: 'Shoot not found' });
  }

  const current = memoryStore.shoots[shootIndex];
  const { photographerId, cinematographerId } = req.body;

  if (photographerId && photographerId !== current.photographerId) {
    const photo = memoryStore.photographers.find(p => p.id === photographerId);
    if (photo) req.body.photographerName = photo.name;
  }
  if (cinematographerId && cinematographerId !== current.cinematographerId) {
    const cine = memoryStore.photographers.find(p => p.id === cinematographerId);
    if (cine) req.body.cinematographerName = cine.name;
  }

  memoryStore.shoots[shootIndex] = {
    ...current,
    ...req.body,
    updated_at: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: memoryStore.shoots[shootIndex],
    message: 'Shoot updated successfully',
  });
});

// POST /api/shoots/:id/send-review - Send to Client Review
router.post('/:id/send-review', (req: Request, res: Response) => {
  const { id } = req.params;
  const shoot = memoryStore.shoots.find(s => s.id === id);
  if (!shoot) return res.status(404).json({ success: false, message: 'Shoot not found' });

  shoot.status = 'CLIENT_REVIEW';
  shoot.progressPercent = 92;
  shoot.updated_at = new Date().toISOString();

  memoryStore.notifications.unshift({
    id: `notif_${Date.now()}`,
    studioId: shoot.studioId,
    recipientRole: 'client',
    title: 'Your Edited Gallery is Ready for Review!',
    message: `Dream Frames has published the edited gallery for ${shoot.title}. Please review and approve.`,
    type: 'success',
    isRead: false,
    link: `/client/gallery/${shoot.id}`,
    created_at: 'Just now',
  });

  memoryStore.activityLogs.unshift({
    id: `act_${Date.now()}`,
    studioId: shoot.studioId,
    shootId: shoot.id,
    actorName: 'Studio Admin',
    actorRole: 'Studio Admin',
    action: 'Dispatched for Client Review',
    details: 'Edited photographs published to client portal for approval.',
    timestamp: 'Just now',
  });

  res.json({ success: true, data: shoot, message: 'Gallery dispatched for client review' });
});

// POST /api/shoots/:id/approve - Client approves gallery
router.post('/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const shoot = memoryStore.shoots.find(s => s.id === id);
  if (!shoot) return res.status(404).json({ success: false, message: 'Shoot not found' });

  shoot.status = 'CLIENT_APPROVED';
  shoot.progressPercent = 96;
  shoot.updated_at = new Date().toISOString();

  memoryStore.notifications.unshift({
    id: `notif_${Date.now()}`,
    studioId: shoot.studioId,
    recipientRole: 'studio_admin',
    title: 'Client Approved Gallery! 🎉',
    message: `Client has approved the photo selection and editing for ${shoot.title}. Ready for printing/delivery.`,
    type: 'success',
    isRead: false,
    link: `/studio/shoots/${shoot.id}`,
    created_at: 'Just now',
  });

  memoryStore.activityLogs.unshift({
    id: `act_${Date.now()}`,
    studioId: shoot.studioId,
    shootId: shoot.id,
    actorName: 'Client',
    actorRole: 'Client',
    action: 'Approved Photo Selection & Editing',
    details: 'Client confirmed approval for final printing and album dispatch.',
    timestamp: 'Just now',
  });

  res.json({ success: true, data: shoot, message: 'Project approved successfully' });
});

export default router;
