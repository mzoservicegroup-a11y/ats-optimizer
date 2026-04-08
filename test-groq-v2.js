
const { Groq } = require('groq-sdk');
require('dotenv').config();

async function testGroq() {
  console.log('Testing Groq with key:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log('Groq Response:', chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error('Groq Error:', err.message);
    if (err.response) console.error('Response Data:', err.response.data);
  }
}

testGroq();
