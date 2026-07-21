const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const sharp = require('sharp');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/cloud/s3');
const storageService = require('../services/storageService');

const Product = require('../models/Product/Product.model');
const Category = require('../models/Category/Category.model');
const Brand = require('../models/Brand/Brand.model');
const Material = require('../models/Material/Material.model');
const Color = require('../models/Color/Color.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mhv_furniture';
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mahaveer-smart-furniture-hub';
const REGION = process.env.AWS_REGION || 'eu-north-1';

const TRACKER_PATH = path.join(__dirname, '..', 'seeders', 'sofa_batch_tracker.json');
const UNSPLASH_IDS_PATH = path.join(__dirname, '..', 'seeders', 'unsplash_ids.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

const seedUniqueSofaImages = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Load data
    if (!fs.existsSync(TRACKER_PATH)) {
      throw new Error(`Tracker not found at: ${TRACKER_PATH}`);
    }
    if (!fs.existsSync(UNSPLASH_IDS_PATH)) {
      throw new Error(`Unsplash IDs cache not found at: ${UNSPLASH_IDS_PATH}`);
    }

    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const unsplashData = JSON.parse(fs.readFileSync(UNSPLASH_IDS_PATH, 'utf8'));

    const sofaUrls = unsplashData.sofa;
    if (!sofaUrls || sofaUrls.length < 350) {
      throw new Error(`Not enough sofa photo URLs in unsplash_ids.json (found ${sofaUrls ? sofaUrls.length : 0})`);
    }

    console.log(`Found ${tracker.length} sofas in tracker and ${sofaUrls.length} unique Unsplash URLs.`);

    // 2. Clean up existing sofa uploads directory
    const sofaUploadsDir = path.join(UPLOADS_DIR, 'products', 'sofa');
    if (fs.existsSync(sofaUploadsDir)) {
      console.log('Cleaning up existing sofa uploads directory...');
      fs.rmSync(sofaUploadsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(sofaUploadsDir, { recursive: true });

    // 3. Process each sofa item
    const CONCURRENCY = 5;
    const downloadQueue = [...tracker];
    let activeDownloads = 0;
    let completedCount = 0;
    let failedCount = 0;

    const startNext = async () => {
      if (downloadQueue.length === 0) return;
      const sofaItem = downloadQueue.shift();
      const idx = sofaItem.id - 1; // 0-indexed based on ID
      activeDownloads++;

      const slugifiedName = storageService.slugify(sofaItem.name);
      const relativeDir = `products/sofa/${slugifiedName}`;
      const absoluteDir = path.join(UPLOADS_DIR, relativeDir);

      if (!fs.existsSync(absoluteDir)) {
        fs.mkdirSync(absoluteDir, { recursive: true });
      }

      // Map unique photo ID/URL
      const rawUrl = sofaUrls[idx % sofaUrls.length];
      const baseUrl = rawUrl.split('_copy_')[0];
      
      // Request clean WebP with consistent 800x600 size
      const imageUrl = `${baseUrl}?fm=webp&fit=crop&w=800&h=600&q=80`;

      const destThumbnail = path.join(absoluteDir, 'thumbnail.webp');
      const destFront = path.join(absoluteDir, 'front.webp');
      const destSide = path.join(absoluteDir, 'side.webp');
      const destBack = path.join(absoluteDir, 'back.webp');
      const destLifestyle = path.join(absoluteDir, 'lifestyle.webp');

      try {
        // Download image buffer with retry and headers
        const res = await fetchWithRetry(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        
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

        // Upload thumbnail to S3
        const s3Key = `${relativeDir}/thumbnail.webp`;
        const params = {
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: processedBuffer,
          ContentType: 'image/webp'
        };
        await s3Client.send(new PutObjectCommand(params));
        
        const s3Url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${s3Key}`;

        // Update database record
        const dbRelativePath = `${relativeDir}/thumbnail.webp`;

        await Product.findOneAndUpdate(
          { sku: sofaItem.sku },
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

        sofaItem.s3Url = s3Url;
        sofaItem.status = 'completed';

        completedCount++;
        if (completedCount % 10 === 0 || completedCount === tracker.length) {
          console.log(`[Progress] Processed and uploaded ${completedCount}/${tracker.length} sofas...`);
        }
      } catch (err) {
        failedCount++;
        console.error(`Failed for sofa "${sofaItem.name}":`, err.message);
      } finally {
        activeDownloads--;
        // Add a small delay between starting next request to be gentle
        await sleep(150);
        if (downloadQueue.length > 0) {
          await startNext();
        }
      }
    };

    // Initialize initial pool of concurrent downloaders
    console.log(`Starting downloads/uploads with concurrency of ${CONCURRENCY}...`);
    const pool = [];
    const initialBatchSize = Math.min(CONCURRENCY, downloadQueue.length);
    for (let i = 0; i < initialBatchSize; i++) {
      pool.push(startNext());
    }
    
    await Promise.all(pool);

    // Save updated tracker file
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf8');

    console.log('\n==================================================');
    console.log('SOFA SEEDING COMPLETE');
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

seedUniqueSofaImages();
