const express = require('express');
const router = express.Router();

const roomRecommendationController = require('../controller/roomRecommendation.controller');
const roomRecommendationValidator = require('../validators/roomRecommendation.validator');
const { softAuthMiddleware } = require('../../../../middleware/authMiddleware');
const upload = require('../../../../config/multer/multer');

// POST /api/ai/room/upload
router.post(
  '/room/upload',
  softAuthMiddleware,
  upload.single('file'),
  roomRecommendationValidator.validateUpload,
  roomRecommendationController.uploadRoomImage
);

// GET /api/ai/history
router.get(
  '/history',
  softAuthMiddleware,
  roomRecommendationController.getHistory
);

// DELETE /api/ai/history/:id
router.delete(
  '/history/:id',
  softAuthMiddleware,
  roomRecommendationValidator.validateDelete,
  roomRecommendationController.deleteHistoryItem
);

module.exports = router;

