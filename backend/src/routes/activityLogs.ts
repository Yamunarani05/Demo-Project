import { Router } from 'express';
import { activityController } from '../controllers/activityController';

const router = Router();

router.get('/', activityController.getActivityLogs);

export default router;
