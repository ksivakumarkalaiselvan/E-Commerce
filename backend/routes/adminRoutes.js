import express from 'express';
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUser,
} from '../services/storage.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all admin routes
router.use(protect, adminOnly);

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json({
      success: true,
      stats,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get all orders with filter & pagination
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const data = await getAllOrders({ status, page, limit });
    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status, trackingNumber, note } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const order = await updateOrderStatus(req.params.id, { status, trackingNumber, note });
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json({
      success: true,
      users,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid role (user/admin) is required' });
    }

    const updated = await updateUser(req.params.id, { role });
    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
