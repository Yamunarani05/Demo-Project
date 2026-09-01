import express from 'express';
import { createComplaint, getComplaints } from '../controller/clientComplaintController';
import { authenticateClient } from '../util/auth';

const router = express.Router();

router.use(authenticateClient);

router.post('/', createComplaint);
router.get('/', getComplaints);

export default router;
