const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const mongoose = require('mongoose');
const sharp = require('sharp');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/cloud/s3');
const storageService = require('../services/storageService');

const Product = require('../models/Product/Product.model');
const Category = require('../models/Category/Category.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mhv_furniture';
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mahaveer-smart-furniture-hub';
const REGION = process.env.AWS_REGION || 'eu-north-1';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const BED_KEYWORDS = [
  'bed frame',
  'wooden bed frame',
  'platform bed',
  'upholstered bed',
  'king bed frame',
  'queen bed frame',
  'single bed frame',
  'double bed frame',
  'metal bed frame',
  'hydraulic storage bed',
  'minimalist bed',
  'luxury bed',
  'solid wood bed',
  'modern bed design'
];

const humanKeywords = [
  'person', 'people', 'man', 'woman', 'human', 'sleep', 'couple', 'girl', 'boy', 'child', 'baby', 'model',
  'posing', 'lifestyle', 'morning', 'sleeping', 'legs', 'feet', 'relaxing', 'bedtime', 'waking', 'love',
  'female', 'male', 'young', 'adult', 'kid', 'childhood', 'family', 'hand', 'leg', 'face', 'portrait',
  'sit', 'sat', 'sitting', 'lie', 'lying', 'relax', 'chill', 'chilling', 'hug', 'kiss', 'happy', 'smile',
  'smiling', 'joy', 'body', 'guy', 'lady', 'selfie', 'photo', 'photographer', 'crowd', 'spectator',
  'tourist', 'clothed', 'clothing', 'apparel', 'dress', 'shirt', 'jeans', 'pants', 'jacket', 'wear', 'wearing',
  'mother', 'father', 'parent', 'son', 'daughter', 'grandparent', 'grandma', 'grandpa', 'hugged', 'hugging',
  'holding', 'touching', 'footwear', 'shoe', 'shoes', 'sock', 'socks', 'arm', 'shoulder', 'hair', 'skin',
  'eye', 'eyes', 'mouth', 'nose', 'belly', 'chest', 'back', 'head', 'blonde', 'brunette'
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const hasHuman = (photo) => {
  const tags = (photo.tags || []).map(t => (t.title || '').toLowerCase());
  const desc = (photo.description || '').toLowerCase();
  const altDesc = (photo.alt_description || '').toLowerCase();

  for (const kw of humanKeywords) {
    if (desc.includes(kw) || altDesc.includes(kw)) {
      return true;
    }
    for (const tag of tags) {
      if (tag.includes(kw)) {
        return true;
      }
    }
  }
  return false;
};

const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      console.warn(`[HTTP ${res.status}] Retrying fetch for ${url} (${i + 1}/${retries})...`);
    } catch (err) {
      console.warn(`[Fetch Error: ${err.message}] Retrying fetch for ${url} (${i + 1}/${retries})...`);
    }
    await sleep(backoff * (i + 1));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries.`);
};

async function getCleanBedPhotoUrls(targetCount) {
  console.log(`Fetching ${targetCount} unique, human-free bed photo URLs...`);
  const collected = [];
  const seen = new Set();
  let kwIdx = 0;
  let page = 1;

  while (collected.length < targetCount && kwIdx < BED_KEYWORDS.length) {
    const keyword = BED_KEYWORDS[kwIdx];
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(keyword)}&per_page=30&page=${page}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        kwIdx++; page = 1; continue;
      }

      for (const photo of data.results) {
        if (!photo.urls?.raw) continue;
        if (hasHuman(photo)) continue;

        const baseUrl = photo.urls.raw.split('?')[0];
        if (!seen.has(baseUrl)) {
          seen.add(baseUrl);
          collected.push(baseUrl);
        }
        if (collected.length >= targetCount) break;
      }

      page++;
      await sleep(150);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      await sleep(1000);
      kwIdx++;
      page = 1;
    }
  }

  console.log(`Collected ${collected.length} unique bed photo URLs.`);
  return collected;
}

const seedUniqueBedImages = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Get all bed products
    const bedCategory = await Category.findOne({ slug: 'bed' });
    if (!bedCategory) {
      throw new Error("Bed category not found in DB.");
    }
    const beds = await Product.find({ category: bedCategory._id });
    console.log(`Found ${beds.length} bed products in database.`);

    if (beds.length === 0) {
      console.log('No bed products to seed.');
      mongoose.connection.close();
      return;
    }

    // 2. Fetch unique human-free photo URLs
    const bedUrls = await getCleanBedPhotoUrls(beds.length);
    if (bedUrls.length < beds.length) {
      console.warn(`WARNING: Only found ${bedUrls.length} unique URLs but have ${beds.length} beds. Cycling URLs to fill.`);
    }

    // 3. Process each bed item
    const CONCURRENCY = 5;
    const downloadQueue = [...beds];
    let activeDownloads = 0;
    let completedCount = 0;
    let failedCount = 0;

    const startNext = async () => {
      if (downloadQueue.length === 0) return;
      const bedItem = downloadQueue.shift();
      const idx = completedCount + failedCount;
      activeDownloads++;

      const slugifiedName = storageService.slugify(bedItem.name);
      const relativeDir = `products/bed/${slugifiedName}`;
      const absoluteDir = path.join(UPLOADS_DIR, relativeDir);

      if (!fs.existsSync(absoluteDir)) {
        fs.mkdirSync(absoluteDir, { recursive: true });
      }

      // Map unique photo ID/URL
      const rawUrl = bedUrls[idx % bedUrls.length];
      const baseUrl = rawUrl.split('_copy_')[0];
      
      // Request clean WebP with consistent 800x600 size
      const imageUrl = `${baseUrl}?fm=webp&fit=crop&w=800&h=600&q=80`;

      const destThumbnail = path.join(absoluteDir, 'thumbnail.webp');
      const destFront = path.join(absoluteDir, 'front.webp');
      const destSide = path.join(absoluteDir, 'side.webp');
      const destBack = path.join(absoluteDir, 'back.webp');
      const destLifestyle = path.join(absoluteDir, 'lifestyle.webp');

      try {
        const res = await fetchWithRetry(imageUrl);
        const buffer = await res.arrayBuffer();
        const imgBuffer = Buffer.from(buffer);

        // Convert/Optimize via sharp
        const processedBuffer = await sharp(imgBuffer)
          .webp({ quality: 80 })
          .toBuffer();

        // Save locally
        fs.writeFileSync(destThumbnail, processedBuffer);
        fs.writeFileSync(destFront, processedBuffer);
        fs.writeFileSync(destSide, processedBuffer);
        fs.writeFileSync(destBack, processedBuffer);
        fs.writeFileSync(destLifestyle, processedBuffer);

        // Upload thumbnail to S3 (optional, if key configured)
        if (process.env.AWS_ACCESS_KEY_ID) {
          const s3Key = `${relativeDir}/thumbnail.webp`;
          const params = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: processedBuffer,
            ContentType: 'image/webp'
          };
          try {
            await s3Client.send(new PutObjectCommand(params));
          } catch (s3Err) {
            console.warn(`S3 upload warning for ${s3Key}: ${s3Err.message}`);
          }
        }

        // Update database record
        const dbRelativePath = `${relativeDir}/thumbnail.webp`;

        await Product.findByIdAndUpdate(
          bedItem._id,
          {
            thumbnail: dbRelativePath,
            images: {
              front: `${relativeDir}/front.webp`,
              side: `${relativeDir}/side.webp`,
              back: `${relativeDir}/back.webp`,
              lifestyle: `${relativeDir}/lifestyle.webp`,
              top: '',
              materialCloseUp: '',
              dimensionImage: ''
            }
          }
        );

        completedCount++;
        if (completedCount % 10 === 0 || completedCount === beds.length) {
          console.log(`[Progress] Processed and updated ${completedCount}/${beds.length} beds...`);
        }
      } catch (err) {
        failedCount++;
        console.error(`Failed for bed "${bedItem.name}":`, err.message);
      } finally {
        activeDownloads--;
        await sleep(150);
        if (downloadQueue.length > 0) {
          await startNext();
        }
      }
    };

    console.log(`Starting downloads/uploads with concurrency of ${CONCURRENCY}...`);
    const pool = [];
    const initialBatchSize = Math.min(CONCURRENCY, downloadQueue.length);
    for (let i = 0; i < initialBatchSize; i++) {
      pool.push(startNext());
    }
    
    await Promise.all(pool);

    console.log('\n==================================================');
    console.log('BED SEEDING COMPLETE');
    console.log('==================================================');
    console.log(`Successfully Seeded: ${completedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log('==================================================\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error running seeder:', error);
    process.exit(1);
  }
};

seedUniqueBedImages();
