const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User/User.model');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';

const seedAdmin = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'Admin@123';

    // Delete existing admin if exists to ensure clean state
    await User.deleteMany({ email: adminEmail });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = new User({
      name: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log(`Successfully seeded Admin user!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
