const fs = require('fs');
const path = require('path');
const { PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/cloud/s3');
require('dotenv').config();

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mahaveer-smart-furniture-hub';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Helper to determine Content-Type
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.webp': return 'image/webp';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.json': return 'application/json';
    default: return 'application/octet-stream';
  }
};

// Recursively traverse directory to find all files
const getFilesRecursively = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip products directory to optimize seed upload (resolved dynamically to cache on S3)
      if (file === 'products') continue;
      getFilesRecursively(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
};

// Check if file already exists in S3 (to allow resuming/preventing redundant uploads)
const checkFileExists = async (key) => {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    // For other errors, assume it doesn't exist and attempt upload
    return false;
  }
};

const run = async () => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.error('Error: uploads directory not found.');
      process.exit(1);
    }

    console.log('Scanning uploads directory (excluding products)...');
    const allFiles = getFilesRecursively(UPLOADS_DIR);
    console.log(`Found ${allFiles.length} files to upload.`);

    let successCount = 0;
    let existCount = 0;
    let failCount = 0;

    // Use concurrency limit to upload multiple files in parallel
    const CONCURRENCY_LIMIT = 25;
    const uploadQueue = [...allFiles];

    const worker = async () => {
      while (uploadQueue.length > 0) {
        const filePath = uploadQueue.shift();
        if (!filePath) continue;

        // Calculate relative key, e.g. "products/sofa/..."
        const relativeKey = path.relative(UPLOADS_DIR, filePath).replace(/\\/g, '/');
        const contentType = getContentType(filePath);

        try {
          const exists = await checkFileExists(relativeKey);
          if (exists) {
            existCount++;
            const totalDone = successCount + existCount + failCount;
            if (totalDone % 100 === 0 || totalDone === allFiles.length) {
              console.log(`[Progress] ${totalDone}/${allFiles.length} processed. (Already exists: ${existCount})`);
            }
            continue;
          }

          const fileBuffer = fs.readFileSync(filePath);
          const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: relativeKey,
            Body: fileBuffer,
            ContentType: contentType
          });

          await s3Client.send(command);
          successCount++;
          const totalDone = successCount + existCount + failCount;
          if (totalDone % 100 === 0 || totalDone === allFiles.length) {
            console.log(`[Progress] ${totalDone}/${allFiles.length} processed. (Uploaded: ${successCount})`);
          }
        } catch (err) {
          console.error(`Failed to upload ${relativeKey}:`, err.message);
          failCount++;
        }
      }
    };

    console.log(`Starting migration to S3 bucket "${BUCKET_NAME}" using ${CONCURRENCY_LIMIT} parallel workers...`);
    const startTime = Date.now();

    // Start workers
    const workers = Array(CONCURRENCY_LIMIT).fill(null).map(() => worker());
    await Promise.all(workers);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n--- Migration Summary ---');
    console.log(`Time taken: ${duration}s`);
    console.log(`Successfully Uploaded: ${successCount}`);
    console.log(`Already Existed in S3: ${existCount}`);
    console.log(`Failed Uploads: ${failCount}`);
    console.log('-------------------------');

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error during migration run:', error);
    process.exit(1);
  }
};

run();
