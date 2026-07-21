const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'c:/Users/HP/OneDrive/Desktop/Major_project_MHV/backend/.env' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
console.log('Using Key:', GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'MOCK_KEY');

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    const result = await model.generateContent("Say hello!");
    console.log('Gemini Success:', result.response.text());
  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
}

test();
