const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

console.log('OPENAI_API_KEY status:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
if (process.env.OPENAI_API_KEY) {
  console.log('API Key starts with:', process.env.OPENAI_API_KEY.substring(0, 7));
}

// Add your OpenAI API key in .env as OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

module.exports = openai;
