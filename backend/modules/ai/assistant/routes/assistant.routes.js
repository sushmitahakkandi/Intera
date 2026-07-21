const express = require('express');
const router = express.Router();
const assistantController = require('../controller/assistant.controller');
const { authMiddleware, softAuthMiddleware, adminMiddleware } = require('../../../../middleware/authMiddleware');

router.post('/chat', softAuthMiddleware, assistantController.chat);
router.get('/sessions', authMiddleware, assistantController.getSessions);
router.delete('/sessions/:id', authMiddleware, assistantController.deleteSession);
router.post('/sessions/:id/feedback', authMiddleware, assistantController.feedback);
router.post('/conversion', softAuthMiddleware, assistantController.conversion);
router.get('/analytics', authMiddleware, adminMiddleware, assistantController.getStats);

module.exports = router;
