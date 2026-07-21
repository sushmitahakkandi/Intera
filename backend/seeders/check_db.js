const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Category = require('../models/Category/Category.model');
const Material = require('../models/Material/Material.model');
const Color = require('../models/Color/Color.model');

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture');
    console.log('Connected to DB.');

    const Product = require('../models/Product/Product.model');
    const categories = await Category.find({});
    console.log('\n--- Categories ---');
    for (const c of categories) {
      const count = await Product.countDocuments({ category: c._id });
      console.log(`Name: ${c.name}, Slug: ${c.slug}, ID: ${c._id}, Products count: ${count}`);
    }

    const materials = await Material.find({});
    console.log('\n--- Materials ---');
    materials.forEach(m => console.log(`Name: ${m.name}, Slug: ${m.slug}, ID: ${m._id}`));

    const colors = await Color.find({});
    console.log('\n--- Colors ---');
    colors.forEach(col => console.log(`Name: ${col.name}, Slug: ${col.slug}, Hex: ${col.hex}, ID: ${col._id}`));

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkDB();
