const mongoose = require('mongoose');

const RoomAnalysisSchema = new mongoose.Schema({
  userId: {
    type: String, // String or ObjectId to be compatible with mock token
    default: '65f123456789abcdef012345'
  },
  roomImage: {
    type: String,
    required: [true, 'Room image original file name is required']
  },
  awsUrl: {
    type: String,
    required: [true, 'Room image URL is required']
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Kitchen', 'Hall', 'Unknown'],
    default: 'Unknown'
  },
  detectedStyle: {
    type: String,
    required: true,
    default: 'Modern'
  },
  detectedColors: {
    type: [String],
    default: []
  },
  detectedMaterials: {
    type: [String],
    default: []
  },
  roomSize: {
    type: String,
    default: 'Standard'
  },
  recommendedCategories: {
    type: [String],
    default: []
  },
  recommendedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  overallConfidence: {
    type: Number,
    default: 0
  },
  confidenceBreakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  roomFeatures: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  detectedPalette: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  layoutPlan: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  spaceOptimizationTips: {
    type: [String],
    default: []
  },
  improvementScoreBefore: {
    type: Number,
    default: 0
  },
  improvementScoreAfter: {
    type: Number,
    default: 0
  },
  budgetOptions: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  premiumOptions: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  alternativeProducts: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  missingFurnitureSuggestions: {
    type: [String],
    default: []
  },
  userPreferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  analysisPipeline: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  geminiResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RoomAnalysis', RoomAnalysisSchema);
