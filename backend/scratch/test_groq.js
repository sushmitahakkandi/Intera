const axios = require('axios');
require('dotenv').config({ path: 'c:/Users/HP/OneDrive/Desktop/Major_project_MHV/backend/.env' });

const GROQ_API_KEY = process.env.GROQ_API_KEY;
console.log('Using Groq Key:', GROQ_API_KEY ? 'Present' : 'Not Present');

async function test() {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: 'Say hello!' }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Groq Success:', response.data.choices[0].message.content);
  } catch (err) {
    console.error('Groq Error:', err.response ? err.response.data : err.message);
  }
}

test();
