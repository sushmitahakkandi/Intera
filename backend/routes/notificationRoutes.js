const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification/notificationController');

router.get('/', notificationController.getNotifications);
router.put('/mark-read', notificationController.markAllRead);

module.exports = router;
