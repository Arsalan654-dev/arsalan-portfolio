const mongoose = require('mongoose');

const technologySchema = new mongoose.Schema({
  technology_title: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  icon: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('technologies', technologySchema);
