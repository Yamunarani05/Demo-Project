import express from 'express';
import { getClientEvents } from '../controller/clientEventController';
import { submitClientEventApproval } from '../controller/clientEventApprovalController';

const router = express.Router();

router.get('/', getClientEvents);
router.post('/submit-selection', submitClientEventApproval);

export default router;
