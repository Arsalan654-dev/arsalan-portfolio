const mongoose = require('mongoose');

const slugSchema = new mongoose.Schema({
  slug_title: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('slugs', slugSchema);
