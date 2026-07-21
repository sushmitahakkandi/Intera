const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product/Product.model');
const Category = require('../models/Category/Category.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const CACHE_DIR = path.join(UPLOADS_DIR, 'cache');
const IDS_FILE_PATH = path.join(__dirname, 'unsplash_ids.json');

const CATEGORIES = ['sofa', 'chair', 'bed', 'dining', 'tables', 'storage'];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Load clean photo URLs
    if (!fs.existsSync(IDS_FILE_PATH)) {
      console.error('Error: unsplash_ids.json does not exist. Please run scraping script first.');
      process.exit(1);
    }
    const categoryUrls = JSON.parse(fs.readFileSync(IDS_FILE_PATH, 'utf8'));

    // 2. Download and Cache unique images (approx 300 total)
    console.log('\n--- Phase 1: Downloading & Caching Category Images ---');
    const cachedFiles = {};

    for (const cat of CATEGORIES) {
      cachedFiles[cat] = [];
      const urls = categoryUrls[cat] || [];
      const catCacheDir = path.join(CACHE_DIR, cat);
      if (!fs.existsSync(catCacheDir)) {
        fs.mkdirSync(catCacheDir, { recursive: true });
      }

      console.log(`Caching up to ${urls.length} images for category: ${cat}`);
      for (let i = 0; i < urls.length; i++) {
        const destPath = path.join(catCacheDir, `img-${i}.webp`);
        cachedFiles[cat].push(destPath);

        if (fs.existsSync(destPath)) {
          // Already cached, skip download
          continue;
        }

        const rawUrl = urls[i].split('_copy_')[0];
        const imageUrl = `${rawUrl}?fm=webp&fit=crop&w=600&h=600&q=80`;

        try {
          console.log(`[Cache] Downloading ${cat} image ${i + 1}/${urls.length}...`);
          const res = await fetch(imageUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(destPath, buffer);
          await sleep(50); // Small pause to be gentle
        } catch (err) {
          console.error(`Failed to download ${cat} image ${i}: ${err.message}`);
          // If fetch fails, use a fallback unsplash image
          const fallbackUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?fm=webp&fit=crop&w=600&h=600&q=80';
          try {
            const res = await fetch(fallbackUrl);
            const buffer = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(destPath, buffer);
          } catch (e) {
            console.error('Fallback also failed.');
          }
        }
      }
    }

    // 3. Query all products from database
    console.log('\n--- Phase 2: Copying Cached Images to Product Paths ---');
    const products = await Product.find({}).populate('category');
    console.log(`Found ${products.length} products to populate.`);

    const categoryIndices = {};
    for (const cat of CATEGORIES) {
      categoryIndices[cat] = 0;
    }

    let copiedCount = 0;
    for (const prod of products) {
      const catSlug = prod.category?.slug?.toLowerCase();
      if (!catSlug || !CATEGORIES.includes(catSlug)) {
        continue;
      }

      const relativePath = prod.thumbnail; // e.g. products/sofa/some-sofa/thumbnail.webp
      const absoluteThumbnailPath = path.join(UPLOADS_DIR, relativePath);
      const productDir = path.dirname(absoluteThumbnailPath);

      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }

      // Map to a cached file
      const index = categoryIndices[catSlug];
      const catCacheFiles = cachedFiles[catSlug] || [];
      if (catCacheFiles.length === 0) continue;

      const sourceFile = catCacheFiles[index % catCacheFiles.length];
      categoryIndices[catSlug]++;

      try {
        const buffer = fs.readFileSync(sourceFile);
        
        // Write thumbnail and all other views
        fs.writeFileSync(absoluteThumbnailPath, buffer);
        
        const otherViews = ['front.webp', 'side.webp', 'back.webp', 'top.webp', 'lifestyle.webp', 'material.webp', 'dimension.webp'];
        for (const view of otherViews) {
          fs.writeFileSync(path.join(productDir, view), buffer);
        }

        copiedCount++;
        if (copiedCount % 100 === 0 || copiedCount === products.length) {
          console.log(`[Progress] Copied images for ${copiedCount}/${products.length} products...`);
        }
      } catch (err) {
        console.error(`Failed to copy images for product "${prod.name}":`, err.message);
      }
    }

    console.log(`\n==================================================`);
    console.log(`SEEDING & DOWNLOADING COMPLETE`);
    console.log(`==================================================`);
    console.log(`Successfully populated: ${copiedCount} products`);
    console.log(`==================================================\n`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error in downloader:', error);
    process.exit(1);
  }
}

run();
