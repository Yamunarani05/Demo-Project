import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../models/db';
import { isDbConnected } from '../config/database';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  return res.status(200).json({
    status: 'HEALTHY',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'LUMINA SaaS Photography Management Backend API',
    postgres: isDbConnected ? 'CONNECTED' : 'DISCONNECTED (FALLBACK_MODE)',
    database: dbStatus,
  });
});

export default router;
