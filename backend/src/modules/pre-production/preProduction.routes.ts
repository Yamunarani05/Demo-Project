import { Router } from 'express';
import { preProductionController } from './preProduction.controller';

const router = Router();

router.get('/projects', preProductionController.getProjects);
router.get('/projects/:projectId/call-details', preProductionController.getCallDetails);
router.put('/projects/:projectId/call-details', preProductionController.updateCallDetails);
router.get('/projects/:projectId/creative-plan', preProductionController.getCreativePlan);
router.put('/projects/:projectId/creative-plan', preProductionController.updateCreativePlan);
router.post('/projects/:projectId/confirm-creative', preProductionController.confirmCreativePlan);
router.post('/projects/:projectId/assign-team', preProductionController.assignTeam);
router.put('/projects/:projectId/assign-team', preProductionController.assignTeam);
router.post('/projects/:projectId/advance', preProductionController.advanceToProduction);

export default router;
