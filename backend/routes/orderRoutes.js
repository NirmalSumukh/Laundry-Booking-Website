// backend/routes/orderRoutes.js
// Order endpoints for customer and admin

const router = require('express').Router();
const { auth, requireAdmin } = require('../middleware/authMiddleware');
const { createOrder, listOrders, updateOrderStatus, myOrders } = require('../controllers/orderController');

// Customer
router.post('/', auth, createOrder);
router.get('/me', auth, myOrders);

// Admin
router.get('/', auth, requireAdmin, listOrders);
router.patch('/:orderId/status', auth, requireAdmin, updateOrderStatus);

module.exports = router;
