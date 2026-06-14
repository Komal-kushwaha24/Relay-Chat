import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { getAuthCookieName } from '../utils/setAuthCookie.js';

export const protect = async (req, res, next) => {
  // 1. Try Authorization: Bearer <token> header first (cross-origin deployments)
  // 2. Fall back to the httpOnly cookie (same-origin / native-app clients)
  let token = null;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = req.cookies[getAuthCookieName()];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token',
    });
  }
};
