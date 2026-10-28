const ChatbotConfig = require('../models/ChatbotConfig');

let gemini = null;

const getGemini = () => {
  if (!gemini && process.env.GEMINI_API_KEY) {
    const OpenAI = require('openai');
    gemini = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: process.env.GEMINI_BASE_URL, // Ye line add ki hai
    });
  }
  return gemini;
};

const getChatbotResponse = async (message, history = []) => {
  const client = getGemini();
  if (!client) return 'Chatbot is not configured.';

  try {
    const config = await ChatbotConfig.findOne();
    const instructions = config?.instructions || 'You are a helpful assistant for Arsalan Portfolio. Answer in Urdu if user writes Urdu.';

    const completion = await client.chat.completions.create({
      model: 'gemini-2.5-flash', // OpenAI ka model nahi, Gemini ka model
      messages: [
        { role: 'system', content: instructions },
       ...history, // Redis se history bhej rahe ho to yahan use karo
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.6, // Support ke liye kam rakho taake factual rahe
    });

    return completion.choices[0]?.message?.content || 'I could not process that.';
  } catch (e) {
    console.log('Gemini Chatbot error:', e.message);
    if (e.status === 429) return 'Thori dair baad try karein. Limit poori ho gayi hai 😅';
    return 'Sorry, I am having trouble responding right now.';
  }
};

module.exports = { getChatbotResponse };