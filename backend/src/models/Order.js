const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemType' },
  itemType: { type: String, enum: ['projects', 'services'] },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'promocodes', default: null },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['paid', 'not paid'], default: 'not paid' },
  orderStatus: { type: String, enum: ['sent', 'not sent'], default: 'not sent' },
  stripePaymentId: { type: String, default: null },
  stripePaymentIntentId: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('orders', orderSchema);
