const express = require('express');
const router = express.Router();
const upload = require('../config/multer/multer');
const imageController = require('../controllers/image/imageController');

// Gallery Listing
router.get('/', imageController.listImages);

// Administrative Uploads
router.post('/upload', upload.array('images', 20), imageController.uploadImages);

// Administrative Image Replacement
router.post('/replace', upload.single('image'), imageController.replaceImage);

// Administrative Bulk Deletion
router.post('/delete-bulk', imageController.deleteImages);

module.exports = router;
