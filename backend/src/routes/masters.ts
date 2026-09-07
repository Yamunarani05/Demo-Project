import { Router } from 'express';
import { masterController } from '../controllers/masterController';

const router = Router();

// GET all masters/studios
router.get('/', masterController.getMasters);

// GET master details
router.get('/:id', masterController.getMasterById);

// POST create master
router.post('/', masterController.createMaster);

// PUT update master
router.put('/:id', masterController.updateMaster);

// DELETE master
router.delete('/:id', masterController.deleteMaster);

// PATCH / PUT update master status
router.patch('/:id/status', masterController.updateStatus);
router.put('/:id/status', masterController.updateStatus);

export default router;
