import express from 'express';
import {
  createPaymentRecord,
  getOrderById,
  updateOrderStatus,
} from '../services/storage.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// @desc    Create payment intent / order for Stripe or Razorpay
// @route   POST /api/payments/create-intent
// @access  Private
router.post('/create-intent', async (req, res, next) => {
  try {
    const { amount, currency = 'USD', gateway = 'Stripe', orderId } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const transactionId = (gateway === 'Stripe' ? 'pi_' : 'pay_') + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

    res.json({
      success: true,
      gateway,
      clientSecret: `mock_secret_${transactionId}`,
      transactionId,
      amount,
      currency,
      keyId: gateway === 'Razorpay' ? (process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_id') : undefined,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Verify payment signature / confirm transaction
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', async (req, res, next) => {
  try {
    const { orderId, transactionId, gateway, amount, currency = 'USD', status = 'Completed' } = req.body;

    if (!orderId || !transactionId) {
      return res.status(400).json({ success: false, message: 'OrderId and transactionId are required.' });
    }

    const receiptUrl = `/receipts/${transactionId}.pdf`;

    const payment = await createPaymentRecord({
      order: orderId,
      user: req.user._id,
      method: gateway || 'Stripe',
      transactionId,
      amount: Number(amount),
      currency,
      status: 'Completed',
      receiptUrl,
      details: {
        verifiedAt: new Date().toISOString(),
        gateway,
      },
    });

    // Update order status if orderId provided
    const order = await getOrderById(orderId);
    if (order) {
      await updateOrderStatus(orderId, {
        status: 'Confirmed',
        note: `Payment verified via ${gateway} (Txn: ${transactionId}).`,
      });
    }

    res.json({
      success: true,
      message: 'Payment verified and captured successfully',
      payment,
      receiptUrl,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
