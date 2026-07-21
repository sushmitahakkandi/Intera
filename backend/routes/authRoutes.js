const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

router.post('/forgot-password-phone', authController.forgotPasswordPhone);
router.post('/verify-otp-phone', authController.verifyOtpPhone);
router.post('/reset-password-phone', authController.resetPasswordPhone);

module.exports = router;
