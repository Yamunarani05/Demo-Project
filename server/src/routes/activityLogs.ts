import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';

const router = Router();

// GET /api/activity-logs - Get real-time activity feed
router.get('/', (req: Request, res: Response) => {
  const { studioId, shootId, limit } = req.query;

  let logs = [...memoryStore.activityLogs];

  if (studioId && studioId !== 'all') {
    logs = logs.filter(l => l.studioId === studioId);
  }

  if (shootId) {
    logs = logs.filter(l => l.shootId === shootId);
  }

  const max = Number(limit) || 20;

  res.json({
    success: true,
    data: logs.slice(0, max),
  });
});

export default router;
