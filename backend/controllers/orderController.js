// backend/controllers/orderController.js
// Create orders, list for admin, update status, restrict visibility based on payment.

const Order = require('../models/Order');
const User = require('../models/User');
const { sendMail } = require('../utils/emailService');

// Customer: create order (initially pending_payment)
const createOrder = async (req, res, next) => {
  try {
    const { items, totalClothes, highPriority, pickupAddress, notes, amountPaise } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }

    const order = await Order.create({
      customer: req.user._id,
      items,
      totalClothes,
      highPriority: !!highPriority,
      pickupAddress,
      notes,
      status: 'pending_payment',
      payment: {
        amount: amountPaise,
        currency: 'INR',
        paid: false,
      },
    });

    return res.status(201).json({ message: 'Order created', orderId: order._id });
  } catch (err) {
    next(err);
  }
};

// Admin: list all paid orders or all orders (filter by status, priority)
const listOrders = async (req, res, next) => {
  try {
    const { status, highPriority } = req.query;
    const query = {};
    if (status) query.status = status;
    if (typeof highPriority !== 'undefined') query.highPriority = highPriority === 'true';

    const orders = await Order.find(query)
      .populate('customer', 'name email address')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// Admin: update order status (e.g., mark 'in_progress', 'out_for_delivery', 'delivered')
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowed = ['confirmed', 'in_progress', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(orderId).populate('customer');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    // Notify customer via email if email exists
    if (order.customer?.email) {
      await sendMail({
        to: order.customer.email,
        subject: `Order ${order._id} status updated to ${status}`,
        html: `<p>Hello ${order.customer.name || 'Customer'},</p><p>Your laundry order status is now: <b>${status}</b>.</p>`,
      });
    }

    res.json({ message: 'Status updated', orderId: order._id, status: order.status });
  } catch (err) {
    next(err);
  }
};

// Customer: get own orders (only paid or all? we show all, but admin sees details only if paid as per requirement)
const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, listOrders, updateOrderStatus, myOrders };
