const s3Upload = require('../utils/s3Upload');

/**
 * Upload single generic image
 */
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = req.body.folder || 'general';
    const baseName = req.body.name || 'image';
    const viewType = req.body.viewType || 'default';

    const result = await s3Upload.uploadImage(req.file, folder, {
      baseName,
      viewType
    });

    res.status(200).json({
      message: 'Image uploaded successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload multiple generic images
 */
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const folder = req.body.folder || 'general';
    const baseName = req.body.name || 'image';
    const viewType = req.body.viewType || 'gallery';

    const uploadPromises = req.files.map((file, index) => {
      return s3Upload.uploadImage(file, folder, {
        baseName: `${baseName}-${index + 1}`,
        viewType
      });
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      message: 'Images uploaded successfully',
      data: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload Product Image Views (Supports multiple views upload)
 * E.g., Front View, Back View, 360 View
 */
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No product image file provided' });
    }

    const { name, category, viewType } = req.body;
    if (!name || !category || !viewType) {
      return res.status(400).json({ error: 'Missing name, category, or viewType in request body' });
    }

    // Determine S3 Folder based on category: e.g. products/sofas
    const categorySlug = s3Upload.slugify(category);
    const s3Folder = `products/${categorySlug}`;

    const result = await s3Upload.uploadImage(req.file, s3Folder, {
      baseName: name,
      viewType: viewType
    });

    res.status(200).json({
      message: 'Product image view uploaded successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload Category Image
 */
const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No category image file provided' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await s3Upload.uploadImage(req.file, 'categories', {
      baseName: name,
      viewType: 'thumbnail'
    });

    res.status(200).json({
      message: 'Category thumbnail uploaded successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload Banner Image (hero-banners, offers, festival)
 */
const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No banner image file provided' });
    }

    const { type, name } = req.body; // type: 'hero-banners', 'offers', 'festival'
    if (!type) {
      return res.status(400).json({ error: 'Banner type is required' });
    }

    const validTypes = ['hero-banners', 'offers', 'festival'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid banner type. Must be hero-banners, offers, or festival.' });
    }

    const result = await s3Upload.uploadImage(req.file, type, {
      baseName: name || 'banner',
      viewType: 'banner'
    });

    res.status(200).json({
      message: 'Banner uploaded successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload User Profile or Room Pictures (profiles, rooms)
 */
const uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { userId, type } = req.body; // type: 'profiles', 'rooms'
    if (!userId || !type) {
      return res.status(400).json({ error: 'userId and type are required' });
    }

    const s3Folder = type === 'profiles' ? 'users/profiles' : 'users/rooms';
    const result = await s3Upload.uploadImage(req.file, s3Folder, {
      baseName: userId,
      viewType: type === 'profiles' ? 'avatar' : 'room'
    });

    res.status(200).json({
      message: 'User image uploaded successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload Review Image
 */
const uploadReviewImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No review image file provided' });
    }

    const { reviewId } = req.body;
    if (!reviewId) {
      return res.status(400).json({ error: 'reviewId is required' });
    }

    const result = await s3Upload.uploadImage(req.file, 'reviews', {
      baseName: reviewId,
      viewType: 'review'
    });

    res.status(200).json({
      message: 'Review image uploaded successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete Image from S3
 */
const deleteImage = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'S3 URL is required for deletion' });
    }

    const result = await s3Upload.deleteImage(url);
    res.status(200).json({
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadProductImage,
  uploadCategoryImage,
  uploadBannerImage,
  uploadUserImage,
  uploadReviewImage,
  deleteImage
};
