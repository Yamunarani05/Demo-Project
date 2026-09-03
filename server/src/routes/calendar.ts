import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';

const router = Router();

// GET /api/calendar - Get calendar events (Shoots, Deadlines, Reviews)
router.get('/', (req: Request, res: Response) => {
  const { studioId, photographerId } = req.query;

  let shoots = [...memoryStore.shoots];

  if (studioId && studioId !== 'all') {
    shoots = shoots.filter(s => s.studioId === studioId);
  }

  if (photographerId && photographerId !== 'all') {
    shoots = shoots.filter(s => s.photographerId === photographerId || s.cinematographerId === photographerId);
  }

  const events = shoots.map(shoot => {
    const client = memoryStore.clients.find(c => c.id === shoot.clientId);
    const studio = memoryStore.studios.find(s => s.id === shoot.studioId);

    // Color coding based on type & status
    let color = '#5E35B1'; // Primary purple
    if (shoot.type === 'Pre-Wedding') color = '#7C3AED'; // Deep Violet
    if (shoot.type === 'Wedding') color = '#EC4899'; // Pink Rose
    if (shoot.type === 'Post-Wedding') color = '#06B6D4'; // Cyan
    if (shoot.type === 'Engagement') color = '#F59E0B'; // Amber
    if (shoot.status === 'COMPLETED') color = '#10B981'; // Emerald

    return {
      id: `event_${shoot.id}`,
      shootId: shoot.id,
      title: shoot.title,
      coupleName: client?.coupleName || 'Couple',
      type: shoot.type,
      status: shoot.status,
      date: shoot.shootDate,
      location: shoot.location,
      photographerName: shoot.photographerName || 'Unassigned',
      studioName: studio?.name || 'Studio',
      color,
    };
  });

  res.json({
    success: true,
    data: events,
  });
});

export default router;
