const express = require('express');
const router = express.Router();
const upload = require('../config/multer/multer');
const uploadController = require('../controllers/uploadController');

// Upload single generic image
router.post('/single', upload.single('image'), uploadController.uploadSingle);

// Upload multiple generic images (up to 12 files)
router.post('/multiple', upload.array('images', 12), uploadController.uploadMultiple);

// Upload specific view image for product
router.post('/product', upload.single('image'), uploadController.uploadProductImage);

// Upload category image
router.post('/category', upload.single('image'), uploadController.uploadCategoryImage);

// Upload banner image
router.post('/banner', upload.single('image'), uploadController.uploadBannerImage);

// Upload user profile/room image
router.post('/user', upload.single('image'), uploadController.uploadUserImage);

// Upload review image
router.post('/review', upload.single('image'), uploadController.uploadReviewImage);

// Delete S3 object
router.delete('/', uploadController.deleteImage);

module.exports = router;
