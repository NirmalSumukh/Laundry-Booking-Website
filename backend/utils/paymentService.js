// backend/utils/paymentService.js
// Razorpay helpers: create order, verify signature

const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const createRazorpayOrder = async ({ amount, currency = 'INR', receipt }) => {
  // amount is in paise (e.g., 49900 for ₹499)
  return razorpay.orders.create({ amount, currency, receipt });
};

// Verify Razorpay payment signature for capture/verification
const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(body).digest('hex');
  return expectedSignature === signature;
};

module.exports = { createRazorpayOrder, verifyPaymentSignature };
