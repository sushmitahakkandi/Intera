const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    trim: true
  },
  images: {
    type: [String], // Array of S3 URLs
    default: []
  },
  thumbnail: {
    type: String // Primary S3 URL
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0
  },
  material: {
    type: String,
    trim: true
  },
  dimensions: {
    type: String,
    trim: true
  },
  colors: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Creates createdAt and updatedAt
});

module.exports = mongoose.model('Product', ProductSchema);
