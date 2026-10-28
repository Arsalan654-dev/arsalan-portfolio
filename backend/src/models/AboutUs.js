const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pictures: [{ type: String }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('aboutus', aboutUsSchema);
