import { Router } from 'express';
import { productionController } from './production.controller';

const router = Router();

router.get('/shoots', productionController.getShoots);
router.get('/shoots/:id', productionController.getShootById);
router.get('/schedules', productionController.getSchedules);
router.get('/shoots/:shootId/runtime', productionController.getEventRuntimeStatus);
router.post('/shoots/:shootId/runtime/start', productionController.startEvent);
router.post('/shoots/:shootId/runtime/pause', productionController.pauseEvent);
router.post('/shoots/:shootId/runtime/end', productionController.endEvent);
router.post('/shoots/:shootId/cards/checkin', productionController.checkInMediaCards);

export default router;
