import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';

const router = Router();

// GET /api/notifications - List notifications with role & studio filter
router.get('/', (req: Request, res: Response) => {
  const { studioId, role } = req.query;

  let notifications = [...memoryStore.notifications];

  if (studioId && studioId !== 'all') {
    notifications = notifications.filter(n => !n.studioId || n.studioId === studioId);
  }

  if (role && role !== 'all') {
    notifications = notifications.filter(n => n.recipientRole === role || n.recipientRole === 'all');
  }

  res.json({
    success: true,
    data: notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
  });
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = memoryStore.notifications.find(n => n.id === id);

  if (notif) {
    notif.isRead = true;
  }

  res.json({ success: true, message: 'Notification marked as read' });
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', (req: Request, res: Response) => {
  memoryStore.notifications.forEach(n => (n.isRead = true));
  res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;
