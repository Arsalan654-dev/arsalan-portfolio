const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  pictures: [{ type: String }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('blogs', blogSchema);
