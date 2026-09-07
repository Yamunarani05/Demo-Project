import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import projectsRoute from './projects';

const router = Router();

// Mount all projects routes
router.use('/', projectsRoute);

export default router;
