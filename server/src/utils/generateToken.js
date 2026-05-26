import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
