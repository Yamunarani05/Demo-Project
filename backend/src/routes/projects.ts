import { Router } from 'express';
import { projectController } from '../controllers/projectController';

const router = Router();

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.patch('/:id/status', projectController.updateStatus);
router.put('/:id/status', projectController.updateStatus);

export default router;
