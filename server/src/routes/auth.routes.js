import { Router } from 'express';
import {
  getMe,
  login as loginHandler,
  logout as logoutHandler,
  register as registerHandler,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', protect, getMe);
router.post('/logout', logoutHandler);

export default router;
