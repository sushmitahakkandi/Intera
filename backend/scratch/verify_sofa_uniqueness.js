const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product/Product.model');
const Category = require('../models/Category/Category.model');

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mhv_furniture');
    console.log('Connected to DB.');

    const sofaCategory = await Category.findOne({ slug: 'sofa' });
    if (!sofaCategory) {
      console.error('Sofa category not found!');
      process.exit(1);
    }

    const sofas = await Product.find({ category: sofaCategory._id });
    console.log(`Total sofas found: ${sofas.length}`);

    const uniqueThumbnails = new Set();
    const uniqueImagesFront = new Set();

    sofas.forEach(s => {
      uniqueThumbnails.add(s.thumbnail);
      if (s.images && s.images.front) {
        uniqueImagesFront.add(s.images.front);
      }
    });

    console.log(`Unique thumbnail URLs: ${uniqueThumbnails.size}`);
    console.log(`Unique front image URLs: ${uniqueImagesFront.size}`);

    // Log the first 5 sofas as samples
    console.log('\nSample Sofas:');
    sofas.slice(0, 5).forEach(s => {
      console.log(`- ${s.name} (${s.sku})`);
      console.log(`  Thumbnail: ${s.thumbnail}`);
      console.log(`  Front Image: ${s.images?.front}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

verify();
