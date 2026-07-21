const express = require('express');
const router = express.Router();
const metaController = require('../controllers/meta/metaController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', metaController.getMetadata);
router.get('/dashboard', authMiddleware, adminMiddleware, metaController.getDashboardStats);

module.exports = router;
