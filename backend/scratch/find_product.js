const mongoose = require('mongoose');
const Product = require('../models/Product/Product.model');

const MONGO_URI = 'mongodb://localhost:27017/mhv_furniture';

async function checkProduct() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the product by name or prefix
    const p = await Product.findOne({ name: /Royal Velvet Accent Chair/i });
    if (p) {
      console.log('Product Found:', {
        name: p.name,
        sku: p.sku,
        thumbnail: p.thumbnail,
        images: p.images
      });
    } else {
      console.log('Product "Royal Velvet Accent Chair" not found.');
    }

    // Let's also check if there are other products with missing/empty image strings
    const emptyThumbnailCount = await Product.countDocuments({ thumbnail: '' });
    console.log(`Products with empty thumbnail field: ${emptyThumbnailCount}`);

    // Let's see some random samples of categories and their image paths
    const sampleChairs = await Product.find({ name: /Chair/i }).limit(5);
    console.log('Sample Chairs:');
    sampleChairs.forEach(c => {
      console.log(`- ${c.name}: thumbnail: ${c.thumbnail}`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkProduct();
