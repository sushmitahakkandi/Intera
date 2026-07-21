const mongoose = require('mongoose');

const AssistantAnalyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['faq', 'recommendation', 'conversion', 'preference_style', 'preference_color', 'satisfaction'],
    required: true
  },
  value: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  rating: {
    type: Number,
    default: null
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssistantAnalytics', AssistantAnalyticsSchema);
