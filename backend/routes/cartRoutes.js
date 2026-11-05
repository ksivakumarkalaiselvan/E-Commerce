import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  syncCart,
} from '../services/storage.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes require user authentication
router.use(protect);

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const cart = await getCart(req.user._id);
    res.json({
      success: true,
      cart,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    const cart = await addToCart(req.user._id, { productId, quantity: quantity || 1 });
    res.json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update
// @access  Private
router.put('/update', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity required' });
    }
    const cart = await updateCartItemQuantity(req.user._id, productId, quantity);
    res.json({
      success: true,
      cart,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
router.delete('/remove/:productId', async (req, res, next) => {
  try {
    const cart = await removeFromCart(req.user._id, req.params.productId);
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Clear all items in cart
// @route   DELETE /api/cart/clear
// @access  Private
router.delete('/clear', async (req, res, next) => {
  try {
    const cart = await clearCart(req.user._id);
    res.json({
      success: true,
      message: 'Cart cleared',
      cart,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Sync guest cart with user account after login
// @route   POST /api/cart/sync
// @access  Private
router.post('/sync', async (req, res, next) => {
  try {
    const { items } = req.body;
    const cart = await syncCart(req.user._id, items || []);
    res.json({
      success: true,
      message: 'Cart synchronized',
      cart,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
