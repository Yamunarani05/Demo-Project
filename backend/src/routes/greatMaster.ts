import { Router } from 'express';
import { greatMasterController } from '../controllers/greatMasterController';
import { masterController } from '../controllers/masterController';

const router = Router();

// Organization-wide overview
router.get('/dashboard', greatMasterController.getDashboard);
router.get('/overview', greatMasterController.getDashboard);

// Master list & performance
router.get('/masters', masterController.getMasters);
router.get('/masters/:masterId', masterController.getMasterById);
router.get('/masters/:masterId/overview', greatMasterController.getMasterOverview);

// Master approvals
router.patch('/masters/:id/status', masterController.updateStatus);
router.put('/masters/:id/status', masterController.updateStatus);

export default router;
