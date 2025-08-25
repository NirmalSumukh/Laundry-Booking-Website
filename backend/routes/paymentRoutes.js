// backend/routes/paymentRoutes.js
// Payment endpoints

const router = require('express').Router();
const { auth } = require('../middleware/authMiddleware');
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');

router.post('/create-order', auth, createPaymentOrder);
router.post('/verify', auth, verifyPayment);

module.exports = router;
