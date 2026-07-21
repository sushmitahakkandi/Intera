const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const bulkImportController = require('../controllers/bulk/bulkImportController');

// Multer storage for data files (CSV, Excel, JSON) - up to 50MB
const dataUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Multer storage for image files (no strict mimeType restrictions, up to 200 files)
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB per image
});

// Validation and import flow
router.post('/validate-file', authMiddleware, adminMiddleware, dataUpload.single('file'), bulkImportController.validateFile);
router.post('/execute-import', authMiddleware, adminMiddleware, bulkImportController.executeImport);

// Bulk image mapping
router.post('/map-images', authMiddleware, adminMiddleware, imageUpload.array('images', 200), bulkImportController.bulkImageMapping);

// Bulk updates and mutations
router.post('/bulk-update', authMiddleware, adminMiddleware, bulkImportController.bulkUpdate);

// Export catalog
router.get('/export', authMiddleware, adminMiddleware, bulkImportController.exportProducts);

// History and report downloading
router.get('/history', authMiddleware, adminMiddleware, bulkImportController.getImportHistory);
router.get('/history/:id/report', authMiddleware, adminMiddleware, bulkImportController.downloadImportReport);

// Legacy operations
router.post('/import-json', authMiddleware, adminMiddleware, bulkImportController.importJSON);
router.post('/import-csv', authMiddleware, adminMiddleware, dataUpload.single('file'), bulkImportController.importCSV);
router.post('/import-excel', authMiddleware, adminMiddleware, dataUpload.single('file'), bulkImportController.importExcel);

module.exports = router;
