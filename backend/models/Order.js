// backend/models/Order.js
// Order schema: number of clothes, items, address, priority, status, payment linkage

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        type: { type: String, required: true }, // shirt, pants, etc.
        quantity: { type: Number, required: true, min: 1 },
        notes: String,
      },
    ],
    totalClothes: { type: Number, required: true, min: 1 },
    highPriority: { type: Boolean, default: false },
    pickupAddress: {
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'in_progress', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending_payment',
    },
    payment: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      amount: Number, // in paise
      currency: { type: String, default: 'INR' },
      paid: { type: Boolean, default: false },
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
