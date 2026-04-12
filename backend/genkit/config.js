const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/google-genai');
require('dotenv').config();

const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  model: 'googleai/gemini-1.5-flash', // Default model
});

module.exports = { ai };
