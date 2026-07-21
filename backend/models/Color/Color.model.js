const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Color name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Color slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  hex: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Color', ColorSchema);
