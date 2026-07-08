const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/cloud/s3');
const sharp = require('sharp');
const path = require('path');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mahaveer-smart-furniture-hub';
const REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * Clean and slugify a string for naming files
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
 * Generate standardized file name
 * Format: {slug}-{view/type}-{timestamp}.webp
 */
const generateFileName = (baseName, type = 'general') => {
  const slug = slugify(baseName || 'image');
  const timestamp = Date.now();
  return `${slug}-${type}-${timestamp}.webp`;
};

/**
 * Process image buffer using Sharp:
 * - Convert to WebP
 * - Compress with quality 80
 * - Optionally resize (default max width 1600px, keeping aspect ratio)
 */
const compressImage = async (buffer, resizeWidth = 1200) => {
  try {
    let pipeline = sharp(buffer)
      .webp({ quality: 80 })
      .rotate(); // Auto-rotate based on EXIF metadata

    if (resizeWidth) {
      pipeline = pipeline.resize({
        width: resizeWidth,
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    return await pipeline.toBuffer();
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
};

/**
 * Upload buffer directly to S3
 */
const uploadToS3 = async (buffer, key, contentType) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Construct the public S3 URL
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  } catch (error) {
    throw new Error(`S3 Upload failed: ${error.message}`);
  }
};

/**
 * Process and Upload a file to S3
 * @param {Object} file - Express Multer file object
 * @param {string} s3Folder - Folder path prefix in S3 (e.g. 'products/sofas')
 * @param {Object} options - Custom upload options { baseName, viewType, resizeWidth }
 */
const uploadImage = async (file, s3Folder, options = {}) => {
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
  const fileName = generateFileName(baseName, viewType);
  
  // Clean folder prefix
  const cleanedFolder = s3Folder.replace(/\/$/, ''); // Remove trailing slash
  const key = `${cleanedFolder}/${fileName}`;

  const url = await uploadToS3(processedBuffer, key, 'image/webp');
  return {
    url,
    key,
    fileName
  };
};

/**
 * Delete an object from S3 using its full URL
 * @param {string} fileUrl - Full S3 URL of the file to delete
 */
const deleteImage = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    // Extract key from URL
    // Format expected: https://bucket-name.s3.region.amazonaws.com/key-path
    const s3Prefix = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`;
    if (!fileUrl.startsWith(s3Prefix)) {
      throw new Error('Invalid S3 URL. URL prefix does not match configured bucket.');
    }

    const key = fileUrl.replace(s3Prefix, '');
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    return { success: true, key };
  } catch (error) {
    throw new Error(`S3 Delete failed: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  slugify,
  generateFileName
};
