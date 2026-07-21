const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/HP/OneDrive/Desktop/Major_project_MHV/backend/.env' });

const assistantService = require('../modules/ai/assistant/services/assistant.service');
const app = require('../app');

async function test() {
  try {
    // Connect to local MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture');
    console.log('Database connected.');

    const userMessage = "can you tell me that is woodden sofa or metal sofa is best for my house";
    console.log('Sending message to Assistant:', userMessage);

    const result = await assistantService.processChat({
      message: userMessage,
      sessionId: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      cartItems: [],
      wishlistItems: []
    });

    console.log('--- Response ---');
    console.log('Reply:', result.reply);
    console.log('Intent:', result.intentMatched);
    console.log('Recommended Products Count:', result.suggestedProducts.length);
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
