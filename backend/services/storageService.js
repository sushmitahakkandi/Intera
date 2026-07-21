const fs = require('fs');
const path = require('path');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/cloud/s3');
const sharp = require('sharp');

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local';
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mahaveer-smart-furniture-hub';
const REGION = process.env.AWS_REGION || 'us-east-1';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Define local upload base directory
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../uploads');

/**
 * Ensure directory path exists locally
 */
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Clean and slugify text for clean naming
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

/**
 * Process image buffer using Sharp (convert to WebP & compress)
 */
const compressImage = async (buffer, width = 1200) => {
  try {
    let pipeline = sharp(buffer)
      .webp({ quality: 80 })
      .rotate(); // Auto-rotate based on EXIF orientation

    if (width) {
      pipeline = pipeline.resize({
        width: width,
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    return await pipeline.toBuffer();
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
};

const getDeterministicIndex = (str, range = 50) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % range;
};

const resolveImageUrl = (key) => {
  if (!key) return '';
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  // Remove any leading slash
  let cleanedKey = key.replace(/^\//, '');

  // Detect seeded product images: e.g. "products/sofa/some-sofa-slug/thumbnail.webp"
  const segments = cleanedKey.split('/');
  if (segments[0] === 'products' && segments.length === 4) {
    const category = segments[1]; // e.g. "sofa"
    const productSlug = segments[2]; // e.g. "classic-stockholm-wood-chesterfield-sofa"
    
    // Hash product slug to get a deterministic index between 0 and 49
    const index = getDeterministicIndex(productSlug, 50);
    cleanedKey = `cache/${category}/img-${index}.webp`;
  }

  if (STORAGE_PROVIDER === 's3') {
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${cleanedKey}`;
  } else {
    return `${BACKEND_URL}/uploads/${cleanedKey}`;
  }
};

/**
 * Upload a file buffer to active storage provider
 */
const uploadFile = async (fileBuffer, key, mimeType = 'image/webp') => {
  const cleanedKey = key.replace(/^\//, '');

  if (STORAGE_PROVIDER === 's3') {
    const params = {
      Bucket: BUCKET_NAME,
      Key: cleanedKey,
      Body: fileBuffer,
      ContentType: mimeType,
    };
    try {
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      return cleanedKey;
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  } else {
    // Local storage path
    const localFilePath = path.join(LOCAL_UPLOAD_DIR, cleanedKey);
    const directory = path.dirname(localFilePath);
    ensureDirExists(directory);

    try {
      fs.writeFileSync(localFilePath, fileBuffer);
      return cleanedKey;
    } catch (error) {
      throw new Error(`Local file write failed: ${error.message}`);
    }
  }
};

/**
 * Process and upload an image (supports both local/S3)
 */
const uploadImage = async (file, folder, options = {}) => {
  const {
    baseName = 'image',
    viewType = 'general',
    resizeWidth = 1200
  } = options;

  if (!file || !file.buffer) {
    throw new Error('No file buffer provided.');
  }

  // Compress and convert to webp
  const processedBuffer = await compressImage(file.buffer, resizeWidth);
  
  const timestamp = Date.now();
  const slug = slugify(baseName);
  const fileName = `${slug}-${viewType}-${timestamp}.webp`;
  
  // Clean folder prefix
  const cleanedFolder = folder.replace(/^\/|\/$/g, '');
  const key = `${cleanedFolder}/${fileName}`;

  const savedKey = await uploadFile(processedBuffer, key, 'image/webp');
  
  return {
    key: savedKey,
    url: resolveImageUrl(savedKey),
    fileName
  };
};

/**
 * Delete a file from the active storage provider
 */
const deleteFile = async (keyOrUrl) => {
  if (!keyOrUrl) return;

  // Extract relative key if full URL was provided
  let key = keyOrUrl;
  const s3Prefix = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`;
  const localPrefix = `${BACKEND_URL}/uploads/`;

  if (keyOrUrl.startsWith(s3Prefix)) {
    key = keyOrUrl.replace(s3Prefix, '');
  } else if (keyOrUrl.startsWith(localPrefix)) {
    key = keyOrUrl.replace(localPrefix, '');
  }
  key = key.replace(/^\//, '');

  if (STORAGE_PROVIDER === 's3') {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    try {
      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
      return { success: true, key };
    } catch (error) {
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  } else {
    const localFilePath = path.join(LOCAL_UPLOAD_DIR, key);
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return { success: true, key };
    } catch (error) {
      throw new Error(`Local file delete failed: ${error.message}`);
    }
  }
};

module.exports = {
  uploadFile,
  uploadImage,
  deleteFile,
  resolveImageUrl,
  slugify,
  STORAGE_PROVIDER
};
