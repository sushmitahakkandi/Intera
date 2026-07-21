const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('../models/Order/Order.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');
    
    const count = await Order.countDocuments({});
    console.log('Total orders in database:', count);
    
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10);
    orders.forEach(o => {
      console.log(`- OrderId: ${o.orderId}, Customer: ${o.customerName}, Email: ${o.email}, Total: ${o.total}, Status: ${o.status}, Date: ${o.date}`);
    });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

run();
