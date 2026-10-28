const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemType' },
  itemType: { type: String, enum: ['projects', 'services'] },
  quantity: { type: Number, default: 1 },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  is2FAEnabled: { type: Boolean, default: false },
  profilePicture: { type: String, default: null },
  profilePicturePublicId: { type: String, default: null },
  mobileNumber: { type: String, default: null, sparse: true },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'countries', default: null },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'cities', default: null },
  address: { type: String, default: null, maxlength: 500 },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'projects' }],
  cart: [cartItemSchema],
  totalPurchasedAmount: { type: Number, default: 0 },
  promoCodesReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'promocodes' }]
}, { timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('users', userSchema);
