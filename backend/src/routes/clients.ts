import { Router } from 'express';
import { clientController } from '../controllers/clientController';

const router = Router();

router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.patch('/:id/status', clientController.updateStatus);
router.put('/:id/status', clientController.updateStatus);

export default router;
