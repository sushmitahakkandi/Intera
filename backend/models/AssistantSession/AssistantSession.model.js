const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  timestamp: {
    type: String,
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  confidenceScores: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  comparisonTable: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  budgetPackage: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

const AssistantSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    default: 'New Design Consultation'
  },
  messages: [MessageSchema],
  preferences: {
    budget: { type: Number, default: 0 },
    colors: { type: [String], default: [] },
    materials: { type: [String], default: [] },
    style: { type: String, default: 'Modern' }
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, default: null }
  },
  convertedToSale: {
    type: Boolean,
    default: false
  },
  salesValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssistantSession', AssistantSessionSchema);
