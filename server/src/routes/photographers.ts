import { Router, Request, Response } from 'express';
import { memoryStore, PhotographerRecord } from '../db';

const router = Router();

// GET /api/photographers - List photographers with studio isolation
router.get('/', (req: Request, res: Response) => {
  const { studioId, availability, search } = req.query;

  let photographers = [...memoryStore.photographers];

  if (studioId && studioId !== 'all') {
    photographers = photographers.filter(p => p.studioId === studioId);
  }

  if (availability && availability !== 'all') {
    photographers = photographers.filter(p => p.availabilityStatus === availability);
  }

  if (search) {
    const q = String(search).toLowerCase();
    photographers = photographers.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.specialization.some(s => s.toLowerCase().includes(q))
    );
  }

  // Populate assigned shoots
  const populated = photographers.map(p => {
    const shoots = memoryStore.shoots.filter(s => s.photographerId === p.id || s.cinematographerId === p.id);
    return {
      ...p,
      shoots,
    };
  });

  res.json({
    success: true,
    data: populated,
    total: populated.length,
  });
});

// GET /api/photographers/:id - Photographer profile and schedule
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const photographer = memoryStore.photographers.find(p => p.id === id);

  if (!photographer) {
    return res.status(404).json({ success: false, message: 'Photographer not found' });
  }

  const assignedShoots = memoryStore.shoots.filter(
    s => s.photographerId === id || s.cinematographerId === id
  );

  res.json({
    success: true,
    data: {
      ...photographer,
      assignedShoots,
      completedShoots: assignedShoots.filter(s => s.status === 'COMPLETED'),
      upcomingShoots: assignedShoots.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED'),
    },
  });
});

// POST /api/photographers/check-availability - Check for double booking conflicts
router.post('/check-availability', (req: Request, res: Response) => {
  const { photographerId, shootDate, currentShootId } = req.body;

  if (!photographerId || !shootDate) {
    return res.status(400).json({ success: false, message: 'photographerId and shootDate are required' });
  }

  const conflictingShoots = memoryStore.shoots.filter(
    s =>
      s.photographerId === photographerId &&
      s.shootDate === shootDate &&
      s.id !== currentShootId &&
      s.status !== 'CANCELLED' &&
      s.status !== 'COMPLETED'
  );

  const isAvailable = conflictingShoots.length === 0;

  res.json({
    success: true,
    isAvailable,
    conflictingShoots,
    message: isAvailable
      ? 'Photographer is available for this date'
      : `Warning: Photographer already has ${conflictingShoots.length} shoot(s) on ${shootDate}`,
  });
});

// POST /api/photographers - Add photographer
router.post('/', (req: Request, res: Response) => {
  const { studioId, name, email, phone, specialization, experience, equipment, bio } = req.body;

  if (!studioId || !name || !email) {
    return res.status(400).json({ success: false, message: 'studioId, name, and email are required' });
  }

  const newPhotographer: PhotographerRecord = {
    id: `photo_${Date.now()}`,
    studioId,
    name,
    email,
    phone: phone || '+91 90000 00000',
    profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    specialization: Array.isArray(specialization) ? specialization : [specialization || 'Candid', 'Pre-Wedding'],
    experience: experience || '4 years',
    rating: 5.0,
    availabilityStatus: 'available',
    assignedShootsCount: 0,
    completedShootsCount: 0,
    equipment: equipment || 'Sony A7 IV, 24-70mm GM',
    bio: bio || 'Passionate visual storyteller with a keen eye for lighting and human connection.',
    created_at: new Date().toISOString(),
  };

  memoryStore.photographers.push(newPhotographer);

  res.status(201).json({
    success: true,
    data: newPhotographer,
    message: 'Photographer added successfully',
  });
});

// PUT /api/photographers/:id - Update photographer
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = memoryStore.photographers.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Photographer not found' });
  }

  memoryStore.photographers[index] = {
    ...memoryStore.photographers[index],
    ...req.body,
  };

  res.json({
    success: true,
    data: memoryStore.photographers[index],
    message: 'Photographer profile updated',
  });
});

export default router;
