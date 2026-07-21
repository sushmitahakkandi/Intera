const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review/reviewController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Get all reviews (Admin only)
router.get('/', authMiddleware, adminMiddleware, reviewController.getReviews);

// Submit a review (Customer storefront)
router.post('/', authMiddleware, reviewController.createReview);

// Get my reviews (Customer storefront)
router.get('/my', authMiddleware, reviewController.getMyReviews);

// Delete review (Customer owner or Admin)
router.delete('/:id', authMiddleware, reviewController.deleteReview);

// Moderate a review (Admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, reviewController.moderateReview);

// Post merchant reply (Admin only)
router.put('/:id/reply', authMiddleware, adminMiddleware, reviewController.postMerchantReply);

// Trigger AI on-demand sentiment refresh (Admin only)
router.post('/:id/analyze', authMiddleware, adminMiddleware, reviewController.refreshReviewAI);

module.exports = router;
