const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Get all customers (Admin only, paginated and searchable)
router.get('/', authMiddleware, adminMiddleware, userController.getUsers);

// Toggle/update customer status (Admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, userController.updateUserStatus);

module.exports = router;
