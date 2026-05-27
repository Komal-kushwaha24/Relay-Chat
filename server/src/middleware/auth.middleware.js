import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { getAuthCookieName } from '../utils/setAuthCookie.js';

export const protect = async (req, res, next) => {
  const token = req.cookies[getAuthCookieName()];

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
