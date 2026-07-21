const mongoose = require('mongoose');

class RoomRecommendationValidator {
  validateDelete(req, res, next) {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }
    next();
  }

  validateUpload(req, res, next) {
    if (!req.file) {
      return res.status(400).json({ error: 'No room photo file uploaded' });
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPG, JPEG, PNG, or WEBP images are allowed' });
    }

    next();
  }
}

module.exports = new RoomRecommendationValidator();
