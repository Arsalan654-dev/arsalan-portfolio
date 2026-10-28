const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  itemType: { type: String, enum: ['projects', 'services'], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemType', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, maxlength: 1000 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('reviews', reviewSchema);
