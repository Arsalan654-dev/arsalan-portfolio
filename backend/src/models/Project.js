const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
  technologies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'technologies' }],
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skills' }],
  projectSlugs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'slugs' }],
  pictures: [{ type: String }],
  videos: [{ type: String }],
  livePreviewUrl: { type: String, default: null },
  price: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('projects', projectSchema);
