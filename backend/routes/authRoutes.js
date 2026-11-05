import express from 'express';
import bcrypt from 'bcryptjs';
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  comparePassword,
  generateToken,
} from '../services/storage.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await createUser({ name, email, password, phone });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password.',
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await findUserById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const updated = await updateUser(req.user._id, {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Add shipping address
// @route   POST /api/auth/addresses
// @access  Private
router.post('/addresses', protect, async (req, res, next) => {
  try {
    const { street, city, state, postalCode, country = 'India', isDefault = false } = req.body;
    if (!street || !city || !state || !postalCode) {
      return res.status(400).json({ success: false, message: 'Please provide all required address fields.' });
    }

    const user = await findUserById(req.user._id);
    let addresses = user.addresses ? [...user.addresses] : [];

    if (isDefault || addresses.length === 0) {
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    }

    const newAddr = {
      _id: 'addr_' + Date.now().toString(36),
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || addresses.length === 0,
    };
    addresses.push(newAddr);

    const updated = await updateUser(req.user._id, { addresses });
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addresses: updated.addresses,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete shipping address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
router.delete('/addresses/:id', protect, async (req, res, next) => {
  try {
    const user = await findUserById(req.user._id);
    const addresses = (user.addresses || []).filter((a) => a._id !== req.params.id);
    const updated = await updateUser(req.user._id, { addresses });
    res.json({
      success: true,
      message: 'Address removed successfully',
      addresses: updated.addresses,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const userWithPass = await findUserByEmail(req.user.email);
    const isMatch = await comparePassword(currentPassword, userWithPass.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUser(req.user._id, { password: hashedPassword });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email address.' });
    }

    const mockToken = 'reset_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    res.json({
      success: true,
      message: 'Password reset link and security token generated.',
      resetToken: mockToken,
      instructions: 'For testing/evaluation, use this token on the reset password page.',
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ success: false, message: 'Email, reset token and new password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUser(user._id, { password: hashedPassword });

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
