const mongoose = require('mongoose');
const Product = require('../models/Product/Product.model');

const MONGO_URI = 'mongodb://localhost:27017/mhv_furniture';

async function countGeneral() {
  try {
    await mongoose.connect(MONGO_URI);
    const count = await Product.countDocuments({ thumbnail: 'products/general/thumbnail.webp' });
    console.log(`Number of products referencing products/general/thumbnail.webp: ${count}`);
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

countGeneral();
