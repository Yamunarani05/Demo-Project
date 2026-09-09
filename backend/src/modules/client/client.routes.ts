import { Router } from 'express';
import { clientController } from './client.controller';

const router = Router();

router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.put('/:id/stage', clientController.updateWorkflowStage);

export default router;
