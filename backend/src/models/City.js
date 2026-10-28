const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  city_name: { type: String, required: true, trim: true },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'countries', required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('cities', citySchema);
