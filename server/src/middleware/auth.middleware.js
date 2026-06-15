import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { getAuthCookieName } from '../utils/setAuthCookie.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const cookieToken = req.cookies[getAuthCookieName()];
  const tokens = [bearerToken, cookieToken].filter(Boolean);

  if (tokens.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  for (const token of tokens) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        continue;
      }

      req.user = user;
      return next();
    } catch {
      // Try the next auth source before rejecting the request.
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized, invalid token',
  });
};
