const mongoose = require('mongoose');
const User = require('../models/User/User.model');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';

const firstNames = [
  'Basavaraj', 'Sneha', 'Rahul', 'Anitha', 'Priya', 'Rajesh', 'Amit', 'Vikram', 'Sunita', 'Kavitha',
  'Arjun', 'Sanjay', 'Divya', 'Rohan', 'Aishwarya', 'Vijay', 'Deepak', 'Meera', 'Ramesh', 'Suresh',
  'Anil', 'Jyothi', 'Kiran', 'Harish', 'Manjunath', 'Latha', 'Shiva', 'Ganesh', 'Lakshmi', 'Nikhil',
  'Karthik', 'Swati', 'Pooja', 'Shruti', 'Preethi', 'Karan', 'Aditya', 'Rishabh', 'Neha', 'Pranav'
];

const lastNames = [
  'H G', 'M', 'R', 'P', 'Kumar', 'Sharma', 'Singh', 'Patel', 'Joshi', 'Nair',
  'Gupta', 'Rao', 'Reddy', 'Verma', 'Das', 'Choudhury', 'Iyer', 'Pillai', 'Shetty', 'Gowda'
];

const seedCustomers = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Encrypting default password...');
    const hashedPassword = await bcrypt.hash('Customer@123', 10);
    console.log('Password encrypted successfully.');

    console.log('Cleaning up existing customer users...');
    // Preserve admin and primary test users
    await User.deleteMany({
      role: 'customer',
      email: { $nin: ['testcustomer@gmail.com', 'basavaraj@gmail.com'] }
    });

    console.log('Generating 2000 customer records...');
    const usersToInsert = [];
    const usedEmails = new Set(['admin@gmail.com', 'testcustomer@gmail.com', 'basavaraj@gmail.com']);

    // Ensure we have at least 2000 customer entries
    while (usersToInsert.length < 2000) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${fName} ${lName}`;
      
      const emailBase = `${fName.toLowerCase()}.${lName.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 100000)}`;
      const email = `${emailBase}@gmail.com`;

      if (!usedEmails.has(email)) {
        usedEmails.add(email);
        const status = Math.random() < 0.08 ? 'Blocked' : 'Active';

        usersToInsert.push({
          name: fullName,
          email,
          password: hashedPassword,
          role: 'customer',
          status
        });
      }
    }

    console.log('Bulk inserting customers into database...');
    await User.insertMany(usersToInsert);
    console.log(`Successfully seeded ${usersToInsert.length} customer records!`);

    await mongoose.disconnect();
    console.log('Database disconnected.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedCustomers();
