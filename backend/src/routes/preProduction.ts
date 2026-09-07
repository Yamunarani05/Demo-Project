import { Router } from 'express';
import { preProductionController } from '../controllers/preProductionController';

const router = Router();

router.get('/projects', preProductionController.getProjects);
router.post('/projects/:projectId/assign-team', preProductionController.assignTeam);
router.put('/projects/:projectId/assign-team', preProductionController.assignTeam);
router.post('/projects/:projectId/advance', preProductionController.advanceToProduction);

export default router;
