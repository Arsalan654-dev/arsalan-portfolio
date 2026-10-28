const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  skill_title: { type: String, required: true, trim: true },
  skill_option: { type: String, enum: ['beginner', 'intermediate', 'expert'], required: true },
  slug: { type: String, unique: true, lowercase: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('skills', skillSchema);
