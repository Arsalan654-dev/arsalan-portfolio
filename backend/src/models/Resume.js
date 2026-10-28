const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  file: { type: String, required: true },
  publicId: { type: String, required: true },
  originalName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('resumes', resumeSchema);
