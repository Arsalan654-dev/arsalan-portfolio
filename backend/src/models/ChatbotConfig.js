const mongoose = require('mongoose');

const chatbotConfigSchema = new mongoose.Schema({
  instructions: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('chatbotconfigs', chatbotConfigSchema);
