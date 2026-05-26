import User from '../models/user.model.js';

export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email, and password are required',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
      lastSeen: user.lastSeen,
    },
  });
};
