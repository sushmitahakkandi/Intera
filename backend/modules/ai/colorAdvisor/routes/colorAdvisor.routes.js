const express = require('express');
const router = express.Router();

const colorAdvisorController = require('../controller/colorAdvisor.controller');
const { softAuthMiddleware } = require('../../../../middleware/authMiddleware');
const upload = require('../../../../config/multer/multer');

// POST /api/ai/color/upload — upload room image, run Gemini + recommendation
router.post(
  '/color/upload',
  softAuthMiddleware,
  upload.single('file'),
  colorAdvisorController.uploadRoomImage
);

// GET /api/ai/color/history — retrieve analysis history for a user
router.get(
  '/color/history',
  softAuthMiddleware,
  colorAdvisorController.getHistory
);

// DELETE /api/ai/color/history/:id — remove a saved analysis
router.delete(
  '/color/history/:id',
  softAuthMiddleware,
  colorAdvisorController.deleteHistoryItem
);

// PUT /api/ai/color/design/:id — save/update design layout coordinates
router.put(
  '/color/design/:id',
  softAuthMiddleware,
  colorAdvisorController.saveDesignLayout
);

module.exports = router;
