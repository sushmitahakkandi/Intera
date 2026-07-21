const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User/User.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');
    
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      console.log('Admin user not found.');
    } else {
      console.log('Admin user found. Checking password "Admin@123"...');
      const isMatch = await bcrypt.compare('Admin@123', admin.password);
      console.log('Does password match "Admin@123"?:', isMatch);
      
      if (!isMatch) {
        console.log('Password does not match! Updating password to "Admin@123"...');
        const newHash = await bcrypt.hash('Admin@123', 10);
        admin.password = newHash;
        await admin.save();
        console.log('Password updated successfully.');
        
        const isMatchNow = await bcrypt.compare('Admin@123', admin.password);
        console.log('Does password match now?:', isMatchNow);
      }
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

run();
