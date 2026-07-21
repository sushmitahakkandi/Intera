const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User/User.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');
    
    const users = await User.find({});
    console.log('Total users in database:', users.length);
    users.forEach(u => {
      console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

run();
