// backend/controllers/paymentController.js
// Razorpay order creation and verification; update Order after successful payment.

const Order = require('../models/Order');
const { createRazorpayOrder, verifyPaymentSignature } = require('../utils/paymentService');

// Create Razorpay Order (server) for a given app order
const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.payment.paid) return res.status(400).json({ message: 'Already paid' });

    // Create Razorpay order using stored amount
    const rpOrder = await createRazorpayOrder({
      amount: order.payment.amount,
      currency: order.payment.currency,
      receipt: `order_${order._id}`,
    });

    // Save razorpay order id
    order.payment.razorpayOrderId = rpOrder.id;
    await order.save();

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.payment.amount,
      currency: order.payment.currency,
      razorpayOrderId: rpOrder.id,
      orderId: order._id,
    });
  } catch (err) {
    next(err);
  }
};

// Verify payment after frontend completes checkout popup
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const valid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!valid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Mark payment as successful
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.payment.paid = true;
    order.status = 'confirmed'; // business rule: paid => confirmed
    await order.save();

    res.json({ message: 'Payment verified', orderId: order._id });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPaymentOrder, verifyPayment };
