const mongoose = require('mongoose');
const storageService = require('../../services/storageService');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    unique: true,
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Product SKU is required'],
    unique: true,
    trim: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Product brand is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 0
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: [true, 'Product material is required']
  },
  color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: [true, 'Product color is required']
  },
  dimensions: {
    type: String,
    required: [true, 'Dimensions are required'],
    trim: true
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: 0
  },
  warranty: {
    type: String,
    default: '1 Year Warranty',
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  features: {
    type: [String],
    default: []
  },
  careInstructions: {
    type: String,
    trim: true
  },
  assemblyRequired: {
    type: Boolean,
    default: false
  },
  availability: {
    type: String,
    enum: ['In Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  images: {
    front: { type: String, default: '' },
    side: { type: String, default: '' },
    back: { type: String, default: '' },
    top: { type: String, default: '' },
    lifestyle: { type: String, default: '' },
    materialCloseUp: { type: String, default: '' },
    dimensionImage: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    images360: { type: [String], default: [] },
    materials: { type: [String], default: [] }
  },
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail image path is required']
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  isAIEligible: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  views: {
    type: Number,
    default: 0
  },
  purchasedCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for dynamic absolute URL of thumbnail
ProductSchema.virtual('thumbnailUrl').get(function () {
  if (!this.thumbnail) return '';
  return storageService.resolveImageUrl(this.thumbnail);
});

// Virtual for dynamic absolute URLs of images object
ProductSchema.virtual('imageUrls').get(function () {
  if (!this.images) return {};
  const resolved = {};
  for (const [view, val] of Object.entries(this.images.toObject())) {
    if (Array.isArray(val)) {
      resolved[view] = val.map(path => path ? storageService.resolveImageUrl(path) : '');
    } else {
      resolved[view] = val ? storageService.resolveImageUrl(val) : '';
    }
  }
  return resolved;
});

module.exports = mongoose.model('Product', ProductSchema);
