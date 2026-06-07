import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/user.model.js';
import { generateToken } from '../utils/generateToken.js';
import { clearAuthCookie, setAuthCookie } from '../utils/setAuthCookie.js';
import { sendEmail } from '../utils/sendEmail.js';

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

const createResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, resetTokenHash };
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link will be sent',
    });
  }

  const { resetToken, resetTokenHash } = createResetToken();
  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  const subject = 'Relay Chat Password Reset';
  const text = `Hello ${user.fullName},\n\nYou requested a password reset for Relay Chat. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email. This link expires in one hour.\n`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Reset your Relay Chat password</h2>
      <p>Hello ${user.fullName},</p>
      <p>You requested a password reset for Relay Chat. Click the button below to set a new password.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;color:#fff;background:#0ea5e9;border-radius:10px;text-decoration:none;">Reset Password</a></p>
      <p>If the button does not work, paste this URL into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, ignore this message. This link expires in one hour.</p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject,
      text,
      html,
    });

    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link will be sent',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Password reset email failed:', error?.message || error);

    return res.status(500).json({
      success: false,
      message: 'Unable to send reset email. Please try again later.',
    });
  }
};

export const validateResetToken = async (req, res) => {
  const token = req.params.token;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Reset token is required',
    });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Reset token is valid',
  });
};

export const resetPassword = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: 'Token and new password are required',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long',
    });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully',
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
        profilePicture: req.user.profilePicture || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { fullName, email, profilePicture } = req.body;

    const updates = {};
    if (fullName != null) updates.fullName = fullName;
    if (email != null) updates.email = email;
    if (profilePicture != null) updates.profilePicture = profilePicture;

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
      context: 'query',
    }).select('-password');

    // Broadcast update over sockets if available
    try {
      const io = req.app?.get('io');
      if (io) {
        const payload = {
          id: updated._id,
          fullName: updated.fullName,
          email: updated.email,
          profilePicture: updated.profilePicture,
        };

        io.emit('user:updated', payload);
        io.updateOnlineUser?.(payload);
      }
    } catch (e) {
      // non-fatal
      console.warn('Failed to emit user:updated', e.message || e);
    }

    res.status(200).json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
