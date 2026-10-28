const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  publicId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('banners', bannerSchema);
