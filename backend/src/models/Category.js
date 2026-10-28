const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category_title: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  icon: { type: String, default: '📁' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('categories', categorySchema);
