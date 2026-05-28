import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import { generateToken } from '../utils/generateToken.js';
import { clearAuthCookie, setAuthCookie } from '../utils/setAuthCookie.js';

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

  setAuthCookie(res, generateToken(user._id));

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

  setAuthCookie(res, generateToken(user._id));

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
      lastSeen: user.lastSeen,
    },
  });
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** Returns all users except the currently authenticated user */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      '_id fullName email profilePicture lastSeen'
    );

    const usersList = users.map((u) => ({
      id: u._id,
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      profilePicture: u.profilePicture,
      lastSeen: u.lastSeen,
    }));

    res.status(200).json({
      success: true,
      users: usersList,
      data: usersList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};
