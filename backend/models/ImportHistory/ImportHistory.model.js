const mongoose = require('mongoose');

const ImportHistorySchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  importDate: {
    type: Date,
    default: Date.now
  },
  productsImported: {
    type: Number,
    default: 0
  },
  productsUpdated: {
    type: Number,
    default: 0
  },
  categoriesCreated: {
    type: Number,
    default: 0
  },
  imagesUploaded: {
    type: Number,
    default: 0
  },
  imagesFailed: {
    type: Number,
    default: 0
  },
  skippedProducts: {
    type: Number,
    default: 0
  },
  duplicateProducts: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['Success', 'Failed'],
    default: 'Success'
  },
  errorDetails: [
    {
      sku: { type: String, default: 'Unknown' },
      name: { type: String, default: '' },
      error: { type: String, required: true }
    }
  ],
  auditLogs: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ImportHistory', ImportHistorySchema);
