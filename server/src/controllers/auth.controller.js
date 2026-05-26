import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import { generateToken } from '../utils/generateToken.js';

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
    token: generateToken(user._id),
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
      lastSeen: user.lastSeen,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
      lastSeen: user.lastSeen,
    },
  });
};

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      profilePicture: req.user.profilePicture,
      lastSeen: req.user.lastSeen,
    },
  });
};
