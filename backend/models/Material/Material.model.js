const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Material slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', MaterialSchema);
