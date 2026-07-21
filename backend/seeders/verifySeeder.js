const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Product = require('../models/Product/Product.model');
const Category = require('../models/Category/Category.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const EXPECTED_COUNTS = {
  Sofa: 450,
  Chair: 400,
  Bed: 400,
  Dining: 350,
  Tables: 450,
  Storage: 450
};

const verify = async () => {
  try {
    console.log('Connecting to database for verification...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const totalProducts = await Product.countDocuments({});
    console.log(`\n==================================================`);
    console.log(`DATABASE VERIFICATION REPORT`);
    console.log(`==================================================`);
    console.log(`Total Products: ${totalProducts} (Expected: 2500)`);
    console.log(`--------------------------------------------------`);

    // Verify per Category
    let categoryCountsMatch = true;
    const categories = await Category.find({});
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat._id });
      const expected = EXPECTED_COUNTS[cat.name] || 0;
      const isMatch = count === expected;
      if (!isMatch) categoryCountsMatch = false;
      console.log(`Category: ${cat.name.padEnd(10)} | Count: ${String(count).padEnd(4)} | Expected: ${String(expected).padEnd(4)} | ${isMatch ? 'PASS' : 'FAIL'}`);
    }
    console.log(`--------------------------------------------------`);

    // Verify uniqueness of SKU
    const skus = await Product.distinct('sku');
    const skusUnique = skus.length === 2500;
    console.log(`Unique SKUs: ${skus.length} (Expected: 2500) | ${skusUnique ? 'PASS' : 'FAIL'}`);

    // Verify uniqueness of Name
    const names = await Product.distinct('name');
    const namesUnique = names.length === 2500;
    console.log(`Unique Names: ${names.length} (Expected: 2500) | ${namesUnique ? 'PASS' : 'FAIL'}`);

    // Verify all products have thumbnail and images views populated
    const missingThumbnail = await Product.countDocuments({ thumbnail: { $in: ['', null] } });
    console.log(`Products missing Thumbnail field: ${missingThumbnail} (Expected: 0) | ${missingThumbnail === 0 ? 'PASS' : 'FAIL'}`);

    const missingFrontView = await Product.countDocuments({ 'images.front': { $in: ['', null] } });
    console.log(`Products missing Front View field: ${missingFrontView} (Expected: 0) | ${missingFrontView === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`--------------------------------------------------`);

    // Verify physical file existence for all thumbnails
    console.log('Verifying physical image files on disk...');
    const products = await Product.find({});
    let missingFilesCount = 0;

    for (const prod of products) {
      if (!prod.thumbnail) {
        missingFilesCount++;
        continue;
      }
      const absolutePath = path.join(UPLOADS_DIR, prod.thumbnail);
      if (!fs.existsSync(absolutePath)) {
        missingFilesCount++;
        if (missingFilesCount <= 5) {
          console.error(`Missing file: ${absolutePath}`);
        }
      }
    }

    if (missingFilesCount > 5) {
      console.error(`... and ${missingFilesCount - 5} more files are missing.`);
    }

    const filesPass = missingFilesCount === 0;
    console.log(`Physical thumbnail files missing: ${missingFilesCount} (Expected: 0) | ${filesPass ? 'PASS' : 'FAIL'}`);
    console.log(`==================================================`);

    const allPassed = (totalProducts === 2500) && categoryCountsMatch && skusUnique && namesUnique && (missingThumbnail === 0) && filesPass;
    
    if (allPassed) {
      console.log('SUCCESS: All checks passed!');
      mongoose.connection.close();
      process.exit(0);
    } else {
      console.log('FAILURE: Mismatch or missing files detected.');
      mongoose.connection.close();
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during database verification:', error);
    process.exit(1);
  }
};

verify();
