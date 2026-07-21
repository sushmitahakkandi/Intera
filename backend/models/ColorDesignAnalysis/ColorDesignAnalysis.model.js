const mongoose = require('mongoose');

const ColorDesignAnalysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: '65f123456789abcdef012345'
  },
  sourceImageName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    default: 'Living Room'
  },
  stylePreference: {
    type: String,
    default: 'Modern'
  },
  detectedWallColors: {
    type: [String],
    default: []
  },
  accentColors: {
    type: [String],
    default: []
  },
  flooringMaterial: {
    type: String,
    default: 'Wood'
  },
  interiorStyle: {
    type: String,
    default: 'Modern'
  },
  roomMood: {
    type: String,
    default: 'Balanced'
  },
  lightingConditions: {
    type: String,
    default: 'Neutral daylight'
  },
  dominantTextures: {
    type: [String],
    default: []
  },
  confidenceScores: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  palette: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  woodFinishes: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  decorRecommendations: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  colorsToAvoid: {
    type: [String],
    default: []
  },
  materialRecommendations: {
    type: [String],
    default: []
  },
  compatibilityScores: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  recommendedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  recommendationBundles: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  shoppingList: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  estimatedTotalCost: {
    type: Number,
    default: 0
  },
  geminiResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  existingFurniture: {
    type: [String],
    default: []
  },
  emptyFloorSpace: {
    type: String,
    default: ''
  },
  windows: {
    type: [String],
    default: []
  },
  doors: {
    type: [String],
    default: []
  },
  perspective: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  layouts: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  activeLayout: {
    type: String,
    default: 'Modern'
  },
  savedLayouts: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ColorDesignAnalysis', ColorDesignAnalysisSchema);
