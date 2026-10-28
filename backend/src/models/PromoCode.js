const mongoose = require('mongoose');

const usageTrackingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  usedCount: { type: Number, default: 0 }
}, { _id: false });

const promoSchema = new mongoose.Schema({
  promoCodeTitle: { type: String, required: true, unique: true },
  minPurchaseAmount: { type: Number, required: true },
  discountPercentage: { type: Number, required: true, min: 1, max: 100 },
  validFrom: { type: Date, required: true },
  validTill: { type: Date, required: true },
  usageLimit: { type: Number, required: true },
  qualifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  usageTracking: [usageTrackingSchema],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('promocodes', promoSchema);
