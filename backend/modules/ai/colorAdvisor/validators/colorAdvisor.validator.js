const mongoose = require('mongoose');

class ColorAdvisorValidator {
  validateUpload(req, res, next) {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image file is required.' });
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Only JPG, PNG, and WEBP images are supported.' });
    }

    next();
  }

  validateDelete(req, res, next) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid analysis ID.' });
    }
    next();
  }
}

module.exports = new ColorAdvisorValidator();
