import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  cancelOrder,
  clearCart,
} from '../services/storage.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountAmount,
      totalPrice,
      isPaid,
      paymentResult,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Incomplete shipping address' });
    }

    const order = await createOrder({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      itemsPrice: Number(itemsPrice) || 0,
      taxPrice: Number(taxPrice) || 0,
      shippingPrice: Number(shippingPrice) || 0,
      discountAmount: Number(discountAmount) || 0,
      totalPrice: Number(totalPrice) || 0,
      isPaid: Boolean(isPaid),
      paymentResult: paymentResult || {},
    });

    // Automatically clear user's cart after order placement
    await clearCart(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get user's past orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', async (req, res, next) => {
  try {
    const orders = await getOrdersByUser(req.user._id);
    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure only the buyer or an admin can view the order
    const buyerId = String(order.user._id || order.user);
    if (buyerId !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await cancelOrder(req.params.id, req.user._id, reason);
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
