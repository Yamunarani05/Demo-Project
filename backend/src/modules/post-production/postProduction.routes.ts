import { Router } from 'express';
import { postProductionController } from './postProduction.controller';

const router = Router();

router.get('/tasks', postProductionController.getTasks);
router.get('/tasks/:id', postProductionController.getTaskById);
router.put('/tasks/:id/status', postProductionController.updateTaskStatus);
router.get('/drives', postProductionController.getDataManagerDrives);
router.put('/drives/:clientId', postProductionController.updateDriveLinks);
router.get('/qc-reviews', postProductionController.getQCReviews);
router.post('/qc-reviews', postProductionController.submitQCReview);

export default router;
