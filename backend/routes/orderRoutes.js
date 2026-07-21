const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Authenticated or guest checkout
router.post('/', orderController.createOrder);

// Retrieve listing (Admin gets all, customer gets own)
router.get('/', authMiddleware, orderController.getOrders);

// Single order details
router.get('/:id', authMiddleware, orderController.getOrderById);

// Admin-only order status transitions
router.patch('/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

// Order cancellations (Admins, or customers if before package shipment)
router.patch('/cancel', authMiddleware, orderController.cancelOrder);

// Customer return requests or Admin return decisions
router.patch('/return', authMiddleware, orderController.processOrderReturn);

// Refund processing triggers (Admin)
router.patch('/refund', authMiddleware, adminMiddleware, orderController.processOrderRefund);

// Tracking updates (Publicly accessible or authenticated)
router.get('/tracking/:id', orderController.getOrderTracking);

// Invoice PDF streaming
router.get('/invoice/:id', orderController.downloadOrderInvoice);

module.exports = router;
