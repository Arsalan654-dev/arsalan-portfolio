const ChatbotConfig = require('../../models/ChatbotConfig');
const { getChatbotResponse } = require('../../services/chatbot.service');

let memoryRateLimit = {};
let memoryHistory = {};

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    const rateKey = `gemini_limit:${sessionId}`;
    const now = Date.now();
    if (!memoryRateLimit[rateKey] || now - memoryRateLimit[rateKey].start > 60000) {
      memoryRateLimit[rateKey] = { start: now, count: 1 };
    } else {
      memoryRateLimit[rateKey].count++;
      if (memoryRateLimit[rateKey].count > 15) {
        return res.status(429).json({ success: false, message: 'Slow down! 1 minute baad try karein.' });
      }
    }

    const historyKey = `chat_history:${sessionId}`;
    const parsedHistory = (memoryHistory[historyKey] || []).slice(-10);

    const reply = await getChatbotResponse(message, parsedHistory);

    if (!memoryHistory[historyKey]) memoryHistory[historyKey] = [];
    memoryHistory[historyKey].push({ role: 'user', content: message });
    memoryHistory[historyKey].push({ role: 'assistant', content: reply });
    if (memoryHistory[historyKey].length > 12) {
      memoryHistory[historyKey] = memoryHistory[historyKey].slice(-12);
    }

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error('Send Message Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getInstructions = async (req, res) => {
  try {
    const config = await ChatbotConfig.findOne();
    return res.status(200).json({
      success: true,
      message: 'Chatbot instructions fetched.',
      data: config || { instructions: '' }
    });
  } catch (error) {
    console.error('Get Chatbot Instructions Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateInstructions = async (req, res) => {
  try {
    const { instructions } = req.body;

    let config = await ChatbotConfig.findOne();
    if (config) {
      config.instructions = instructions;
      await config.save();
    } else {
      config = await ChatbotConfig.create({ instructions });
    }

    return res.status(200).json({
      success: true,
      message: 'Chatbot instructions updated.',
      data: config
    });
  } catch (error) {
    console.error('Update Chatbot Instructions Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
