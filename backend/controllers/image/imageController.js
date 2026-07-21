const fs = require('fs');
const path = require('path');
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const s3Client = require('../../config/cloud/s3');
const storageService = require('../../services/storageService');
const Product = require('../../models/Product/Product.model');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mahaveer-smart-furniture-hub';

/**
 * Helper: Recursively find files in local uploads folder
 */
const getLocalFiles = (dirPath, fileList = []) => {
  if (!fs.existsSync(dirPath)) return fileList;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      getLocalFiles(filePath, fileList);
    } else {
      // Get relative path from uploads folder
      const relative = path.relative(path.join(__dirname, '../../uploads'), filePath).replace(/\\/g, '/');
      fileList.push({
        key: relative,
        url: storageService.resolveImageUrl(relative),
        fileName: file,
        size: fs.statSync(filePath).size,
        updatedAt: fs.statSync(filePath).mtime
      });
    }
  }
  return fileList;
};

/**
 * List all images in the active gallery (Local or S3)
 */
const listImages = async (req, res) => {
  try {
    if (storageService.STORAGE_PROVIDER === 's3') {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'products/'
      });
      const response = await s3Client.send(command);
      
      const files = (response.Contents || []).map(item => ({
        key: item.Key,
        url: storageService.resolveImageUrl(item.Key),
        fileName: path.basename(item.Key),
        size: item.Size,
        updatedAt: item.LastModified
      }));

      res.status(200).json({ provider: 's3', files });
    } else {
      // Local listing
      const localProductsDir = path.join(__dirname, '../../uploads/products');
      const files = getLocalFiles(localProductsDir);
      
      // Sort by updatedAt descending
      files.sort((a, b) => b.updatedAt - a.updatedAt);
      
      res.status(200).json({ provider: 'local', files });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload single or multiple images to a specific folder
 */
const uploadImages = async (req, res) => {
  try {
    if (!req.files && !req.file) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : [req.file];
    const folder = req.body.folder || 'products/general';
    const baseName = req.body.name || 'image';
    const viewType = req.body.viewType || 'general';

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const suffix = files.length > 1 ? `-${i + 1}` : '';
      const result = await storageService.uploadImage(files[i], folder, {
        baseName: `${baseName}${suffix}`,
        viewType
      });
      results.push(result);
    }

    res.status(200).json({
      message: 'Images uploaded successfully',
      data: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Replace an image (deletes old image path, uploads new one)
 */
const replaceImage = async (req, res) => {
  try {
    const { oldKey, folder, name, viewType } = req.body;
    if (!oldKey || !req.file) {
      return res.status(400).json({ error: 'Missing oldKey or new file' });
    }

    // Delete old image
    await storageService.deleteFile(oldKey).catch(err => {
      console.warn(`Could not delete old image: ${err.message}`);
    });

    // Upload new image
    const result = await storageService.uploadImage(req.file, folder || 'products/general', {
      baseName: name || 'replaced-image',
      viewType: viewType || 'general'
    });

    // Update references in product model if applicable
    await Product.updateMany({ thumbnail: oldKey }, { $set: { thumbnail: result.key } });
    await Product.updateMany({ 'images.front': oldKey }, { $set: { 'images.front': result.key } });
    await Product.updateMany({ 'images.side': oldKey }, { $set: { 'images.side': result.key } });
    await Product.updateMany({ 'images.back': oldKey }, { $set: { 'images.back': result.key } });
    await Product.updateMany({ 'images.top': oldKey }, { $set: { 'images.top': result.key } });
    await Product.updateMany({ 'images.lifestyle': oldKey }, { $set: { 'images.lifestyle': result.key } });
    await Product.updateMany({ 'images.materialCloseUp': oldKey }, { $set: { 'images.materialCloseUp': result.key } });
    await Product.updateMany({ 'images.dimensionImage': oldKey }, { $set: { 'images.dimensionImage': result.key } });

    res.status(200).json({
      message: 'Image replaced successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a single or multiple images (Bulk Delete)
 */
const deleteImages = async (req, res) => {
  try {
    const { keys } = req.body; // Expects array of keys
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: 'Keys array is required for deletion' });
    }

    const results = { success: [], failed: [] };

    for (const key of keys) {
      try {
        await storageService.deleteFile(key);
        
        // Clear references in database
        const updateQuery = {
          $set: {}
        };
        
        // Nullify matching image fields
        await Product.updateMany({ thumbnail: key }, { $set: { thumbnail: '' } });
        await Product.updateMany({ 'images.front': key }, { $set: { 'images.front': '' } });
        await Product.updateMany({ 'images.side': key }, { $set: { 'images.side': '' } });
        await Product.updateMany({ 'images.back': key }, { $set: { 'images.back': '' } });
        await Product.updateMany({ 'images.top': key }, { $set: { 'images.top': '' } });
        await Product.updateMany({ 'images.lifestyle': key }, { $set: { 'images.lifestyle': '' } });
        await Product.updateMany({ 'images.materialCloseUp': key }, { $set: { 'images.materialCloseUp': '' } });
        await Product.updateMany({ 'images.dimensionImage': key }, { $set: { 'images.dimensionImage': '' } });

        results.success.push(key);
      } catch (err) {
        results.failed.push({ key, error: err.message });
      }
    }

    res.status(200).json({
      message: 'Deletion operation completed',
      data: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listImages,
  uploadImages,
  replaceImage,
  deleteImages
};
