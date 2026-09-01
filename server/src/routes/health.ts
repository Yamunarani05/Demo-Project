import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  return res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Demo Project API',
    database: dbStatus,
  });
});

export default router;
