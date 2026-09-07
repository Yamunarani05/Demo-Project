import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public Auth Endpoints (Protected by auth rate limiter)
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/personas', authController.getPersonas);

// Backwards-compatible registration endpoint for signup wizard
router.post('/register-studio', authLimiter, authController.register);

// Protected Auth Endpoints
router.get('/me', authController.getMe);
router.post('/refresh', authenticateToken, authController.refresh);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

export default router;
