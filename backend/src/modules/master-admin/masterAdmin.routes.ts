import { Router } from 'express';
import { masterAdminController } from './masterAdmin.controller';

const router = Router();

router.get('/dashboard', masterAdminController.getDashboard);
router.get('/clients', masterAdminController.getClients);
router.get('/clients/:id', masterAdminController.getClientDetail);
router.get('/employees', masterAdminController.getEmployees);
router.get('/attendance', masterAdminController.getAttendance);
router.get('/activity', masterAdminController.getActivityLogs);

export default router;
