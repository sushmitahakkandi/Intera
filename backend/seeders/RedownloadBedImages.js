/**
 * RedownloadBedImages.js
 * Re-fetches ONLY bed category product images using furniture-specific,
 * no-people Unsplash search queries, then overwrites existing bed thumbnails.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product/Product.model');
const Category = require('../models/Category/Category.model'); // needed for populate

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Precise furniture-only queries — NO lifestyle/human keywords
const BED_KEYWORDS = [
  'bed frame furniture',
  'wooden bed frame',
  'platform bed furniture',
  'upholstered bed headboard',
  'king size bed frame',
  'queen size bed furniture',
  'modern bed design furniture',
  'hydraulic storage bed',
  'minimalist bed frame',
  'luxury bed headboard furniture',
  'solid wood bed frame product',
  'white bed frame furniture',
  'walnut bed frame',
  'bed furniture product photography',
  'bedroom furniture bed isolated'
];

const CONCURRENCY = 5;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchBedPhotoUrls(targetCount) {
  console.log(`Fetching ${targetCount} unique bed furniture photo URLs...`);
  const collected = [];
  const seen = new Set();
  let kwIdx = 0;
  let page = 1;

  while (collected.length < targetCount && kwIdx < BED_KEYWORDS.length) {
    const keyword = BED_KEYWORDS[kwIdx];
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(keyword)}&per_page=30&page=${page}`;
    try {
      console.log(`  [${collected.length}/${targetCount}] query="${keyword}" page=${page}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        kwIdx++; page = 1; continue;
      }

      for (const photo of data.results) {
        if (!photo.urls?.raw) continue;

        // Filter out photos that contain people/humans based on tags
        const tags = (photo.tags || []).map(t => (t.title || '').toLowerCase());
        const desc = (photo.description || photo.alt_description || '').toLowerCase();
        const humanKeywords = ['person', 'people', 'man', 'woman', 'human', 'sleep', 'couple', 'girl', 'boy', 'child', 'baby', 'model'];
        const hasPeople = humanKeywords.some(k => tags.includes(k) || desc.includes(k));

        if (hasPeople) continue; // skip images with people

        const baseUrl = photo.urls.raw.split('?')[0];
        if (!seen.has(baseUrl)) {
          seen.add(baseUrl);
          collected.push(baseUrl);
        }
        if (collected.length >= targetCount) break;
      }

      page++;
      await sleep(120);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
      await sleep(800);
      kwIdx++;
      page = 1;
    }
  }

  console.log(`Collected ${collected.length} unique bed furniture photo URLs.`);
  return collected;
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.\n');

    // Get all bed products
    const bedProducts = await Product.find({}).populate('category');
    const beds = bedProducts.filter(p => p.category?.slug === 'bed');
    console.log(`Found ${beds.length} bed products.\n`);

    if (beds.length === 0) {
      console.log('No bed products found.');
      process.exit(0);
    }

    // Fetch unique photo URLs
    const photoUrls = await fetchBedPhotoUrls(beds.length);

    // Build download queue — always overwrite bed images regardless of existing file
    const downloadQueue = beds.map((prod, i) => {
      const dest = path.join(UPLOADS_DIR, prod.thumbnail);
      const baseUrl = photoUrls[i % photoUrls.length];
      const imageUrl = `${baseUrl}?fm=webp&fit=crop&w=500&h=500&q=80`;
      return { name: prod.name, dest, url: imageUrl };
    });

    console.log(`\nStarting download of ${downloadQueue.length} bed images...\n`);

    let done = 0, failed = 0;

    const startNext = async () => {
      if (downloadQueue.length === 0) return;
      const task = downloadQueue.shift();
      const dir = path.dirname(task.dest);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      let attempts = 0;
      const maxAttempts = 3;
      let success = false;

      while (attempts < maxAttempts && !success) {
        attempts++;
        try {
          const res = await fetch(task.url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = await res.arrayBuffer();
          fs.writeFileSync(task.dest, Buffer.from(buf));
          success = true;
          done++;
          if (done % 50 === 0 || done === beds.length) {
            console.log(`  [Progress] ${done}/${beds.length} bed images downloaded...`);
          }
        } catch (err) {
          if (attempts >= maxAttempts) {
            failed++;
            console.error(`  Failed: "${task.name}" after ${maxAttempts} attempts — ${err.message}`);
          } else {
            await sleep(500 * attempts);
          }
        }
      }
      if (downloadQueue.length > 0) await startNext();
    };

    const pool = Array.from({ length: Math.min(CONCURRENCY, downloadQueue.length) }, () => startNext());
    await Promise.all(pool);

    console.log(`\n==================================================`);
    console.log(`BED IMAGE REDOWNLOAD COMPLETE`);
    console.log(`==================================================`);
    console.log(`Successful: ${done}`);
    console.log(`Failed:     ${failed}`);
    console.log(`==================================================\n`);

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

run();
