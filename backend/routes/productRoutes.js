const express = require('express');
const router = express.Router();
const productController = require('../controllers/product/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// Protected admin endpoints
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);
router.patch('/status', authMiddleware, adminMiddleware, productController.updateProductStatus);
router.post('/bulk', authMiddleware, adminMiddleware, productController.bulkOperations);

module.exports = router;
