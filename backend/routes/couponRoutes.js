const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon/couponController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Get all coupons (Admin list)
router.get('/', authMiddleware, adminMiddleware, couponController.getCoupons);

// Get active coupons (Public / Storefront)
router.get('/active', couponController.getActiveCoupons);

// Validate a coupon (Public / Storefront)
router.post('/validate', couponController.validateCoupon);

// Create a coupon (Admin only)
router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);

// Toggle status (Admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, couponController.toggleCouponStatus);

// Delete coupon (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);

// Generate coupon via AI (Admin only)
router.post('/generate-ai', authMiddleware, adminMiddleware, couponController.generateAICoupon);

module.exports = router;
