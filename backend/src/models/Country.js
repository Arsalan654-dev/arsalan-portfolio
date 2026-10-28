const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  country_name: { type: String, required: true, unique: true, trim: true },
  country_code: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('countries', countrySchema);
