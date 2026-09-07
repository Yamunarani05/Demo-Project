import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

router.get('/', dashboardController.getStats);
router.get('/stats', dashboardController.getStats);
router.get('/revenue', dashboardController.getRevenue);
router.get('/super-admin', dashboardController.getSuperAdminDashboard);

export default router;
