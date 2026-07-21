const mongoose = require('mongoose');
const User = require('../models/User/User.model');
const Product = require('../models/Product/Product.model');

const MONGO_URI = 'mongodb://localhost:27017/mhv_furniture';

async function checkDb() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB');

    // Check users
    const usersCount = await User.countDocuments();
    console.log(`Total users in database: ${usersCount}`);

    const admins = await User.find({ role: 'admin' });
    console.log('Admins found:');
    admins.forEach(admin => {
      console.log(`- Name: ${admin.name}, Email: ${admin.email}, Role: ${admin.role}, ID: ${admin._id}`);
    });

    // Check products
    const productsCount = await Product.countDocuments();
    console.log(`Total products in database: ${productsCount}`);

    if (productsCount > 0) {
      const sampleProducts = await Product.find().limit(3);
      console.log('Sample Products details:');
      sampleProducts.forEach(prod => {
        console.log(`- Name: ${prod.name}`);
        console.log(`  SKU: ${prod.sku}`);
        console.log(`  Thumbnail: ${prod.thumbnail}`);
        console.log(`  Images:`, prod.images);
      });
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error checking database:', err);
  }
}

checkDb();
