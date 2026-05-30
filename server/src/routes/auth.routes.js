import { Router } from 'express';
import {
  getMe,
  updateMe,
  getUsers,
  login as loginHandler,
  logout as logoutHandler,
  register as registerHandler,
  forgotPassword,
  validateResetToken,
  resetPassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/users', protect, getUsers);
router.post('/logout', logoutHandler);

export default router;
