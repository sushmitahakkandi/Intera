const mongoose = require('mongoose');
const Product = require('../../models/Product/Product.model');
const Category = require('../../models/Category/Category.model');
const Brand = require('../../models/Brand/Brand.model');
const Material = require('../../models/Material/Material.model');
const Color = require('../../models/Color/Color.model');
const storageService = require('../../services/storageService');

/**
 * Helper to broadcast real-time sync
 */
const broadcastCatalogChange = (req) => {
  const io = req.app.get('io');
  if (io) {
    io.emit('catalog_changed', { timestamp: new Date() });
    console.log('Socket.io: Broadcasted catalog_changed event');
  }
};

/**
 * Get all products with advanced filtering, searching, sorting, and pagination
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      material,
      color,
      brand,
      minPrice,
      maxPrice,
      rating,
      availability,
      status,
      sortBy,
      isFeatured,
      isTrending,
      isNewArrival,
      isBestSeller,
      isRecommended,
      isAIEligible
    } = req.query;

    const query = {};

    // 1. Text Search Filter (Name, SKU, Description, Subcategory)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Relational filters (resolve slugs OR direct ObjectIds)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: storageService.slugify(category) });
        if (catDoc) query.category = catDoc._id;
        else return res.status(200).json({ products: [], page: Number(page), limit: Number(limit), totalProducts: 0, totalPages: 0 });
      }
    }

    if (material) {
      if (mongoose.Types.ObjectId.isValid(material)) {
        query.material = material;
      } else {
        const matDoc = await Material.findOne({ slug: storageService.slugify(material) });
        if (matDoc) query.material = matDoc._id;
        else return res.status(200).json({ products: [], page: Number(page), limit: Number(limit), totalProducts: 0, totalPages: 0 });
      }
    }

    if (color) {
      if (mongoose.Types.ObjectId.isValid(color)) {
        query.color = color;
      } else {
        const colDoc = await Color.findOne({ slug: storageService.slugify(color) });
        if (colDoc) query.color = colDoc._id;
        else return res.status(200).json({ products: [], page: Number(page), limit: Number(limit), totalProducts: 0, totalPages: 0 });
      }
    }

    if (brand) {
      if (mongoose.Types.ObjectId.isValid(brand)) {
        query.brand = brand;
      } else {
        const brandDoc = await Brand.findOne({ slug: storageService.slugify(brand) });
        if (brandDoc) query.brand = brandDoc._id;
        else return res.status(200).json({ products: [], page: Number(page), limit: Number(limit), totalProducts: 0, totalPages: 0 });
      }
    }

    // 3. Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 4. Rating Filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // 5. Availability Filter
    if (availability) {
      query.availability = availability;
    }

    // 6. Status Filter
    if (status) {
      if (status === 'Active') {
        query.status = { $ne: 'Inactive' };
      } else {
        query.status = status;
      }
    }

    // 7. Boolean Flag Filters
    const booleanFlags = {
      isFeatured,
      isTrending,
      isNewArrival,
      isBestSeller,
      isRecommended,
      isAIEligible
    };
    for (const [flag, val] of Object.entries(booleanFlags)) {
      if (val !== undefined) {
        query[flag] = val === 'true';
      }
    }

    // Determine Sorting Options
    let sortObj = { createdAt: -1 }; // default newest first
    if (sortBy) {
      switch (sortBy) {
        case 'oldest':
          sortObj = { createdAt: 1 };
          break;
        case 'price-low':
          sortObj = { price: 1 };
          break;
        case 'price-high':
          sortObj = { price: -1 };
          break;
        case 'stock-low':
          sortObj = { stock: 1 };
          break;
        case 'stock-high':
          sortObj = { stock: -1 };
          break;
        case 'rating':
          sortObj = { rating: -1 };
          break;
        case 'most-viewed':
          sortObj = { views: -1 };
          break;
        case 'most-purchased':
          sortObj = { purchasedCount: -1 };
          break;
        default:
          sortObj = { createdAt: -1 };
      }
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .populate('material', 'name slug')
      .populate('color', 'name slug hex')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      products,
      page: pageNum,
      limit: limitNum,
      totalProducts,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get product by ID (increments views count automatically)
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('category')
      .populate('brand')
      .populate('material')
      .populate('color');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new product
 */
const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Unique name validation
    const duplicateName = await Product.findOne({ name: { $regex: new RegExp(`^${productData.name.trim()}$`, 'i') } });
    if (duplicateName) {
      return res.status(400).json({ error: 'Product name must be unique' });
    }

    // Generate SKU if empty
    if (!productData.sku || productData.sku.trim() === '') {
      productData.sku = `SMART-${Date.now()}`;
    } else {
      const duplicateSku = await Product.findOne({ sku: productData.sku.trim() });
      if (duplicateSku) {
        return res.status(400).json({ error: 'Product SKU must be unique' });
      }
    }

    // Validate relations exist
    const [catExists, brandExists, matExists, colExists] = await Promise.all([
      Category.findById(productData.category),
      Brand.findById(productData.brand),
      Material.findById(productData.material),
      Color.findById(productData.color)
    ]);

    if (!catExists) return res.status(400).json({ error: 'Invalid category reference' });
    if (!brandExists) return res.status(400).json({ error: 'Invalid brand reference' });
    if (!matExists) return res.status(400).json({ error: 'Invalid material reference' });
    if (!colExists) return res.status(400).json({ error: 'Invalid color reference' });

    // Set Created By reference
    if (req.user && req.user._id) {
      productData.createdBy = req.user._id;
    }

    const newProduct = new Product(productData);
    await newProduct.save();

    broadcastCatalogChange(req);

    res.status(201).json({
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update an existing product
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Name uniqueness check
    if (updateData.name && updateData.name.trim().toLowerCase() !== product.name.toLowerCase()) {
      const duplicateName = await Product.findOne({ name: { $regex: new RegExp(`^${updateData.name.trim()}$`, 'i') } });
      if (duplicateName) {
        return res.status(400).json({ error: 'Product name must be unique' });
      }
    }

    // SKU uniqueness check
    if (updateData.sku && updateData.sku.trim() !== product.sku) {
      const duplicateSku = await Product.findOne({ sku: updateData.sku.trim() });
      if (duplicateSku) {
        return res.status(400).json({ error: 'Product SKU must be unique' });
      }
    }

    // Validate relationships if changing
    if (updateData.category && updateData.category !== String(product.category)) {
      const exists = await Category.findById(updateData.category);
      if (!exists) return res.status(400).json({ error: 'Invalid category reference' });
    }
    if (updateData.brand && updateData.brand !== String(product.brand)) {
      const exists = await Brand.findById(updateData.brand);
      if (!exists) return res.status(400).json({ error: 'Invalid brand reference' });
    }
    if (updateData.material && updateData.material !== String(product.material)) {
      const exists = await Material.findById(updateData.material);
      if (!exists) return res.status(400).json({ error: 'Invalid material reference' });
    }
    if (updateData.color && updateData.color !== String(product.color)) {
      const exists = await Color.findById(updateData.color);
      if (!exists) return res.status(400).json({ error: 'Invalid color reference' });
    }

    // Clean up replaced images from S3
    if (updateData.imagesToDelete && Array.isArray(updateData.imagesToDelete)) {
      const deletionPromises = updateData.imagesToDelete.map(url => {
        if (url) {
          return storageService.deleteFile(url).catch(err => console.error("S3 Cleanup Failure:", err.message));
        }
      });
      await Promise.all(deletionPromises);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    broadcastCatalogChange(req);

    res.status(200).json({
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete a product and its associated uploaded images
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete product images from S3
    const deletionPromises = [];
    if (product.thumbnail) {
      deletionPromises.push(storageService.deleteFile(product.thumbnail).catch(() => {}));
    }
    if (product.images) {
      const imagesObj = product.images.toObject();
      for (const [_, val] of Object.entries(imagesObj)) {
        if (Array.isArray(val)) {
          val.forEach(file => {
            if (file) deletionPromises.push(storageService.deleteFile(file).catch(() => {}));
          });
        } else if (val) {
          deletionPromises.push(storageService.deleteFile(val).catch(() => {}));
        }
      }
    }

    await Promise.all(deletionPromises);
    await Product.findByIdAndDelete(id);

    broadcastCatalogChange(req);

    res.status(200).json({ message: 'Product and associated images deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fast patch product status
 */
const updateProductStatus = async (req, res) => {
  try {
    const { id, ids, status } = req.body;
    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (Active or Inactive) is required' });
    }

    if (ids && Array.isArray(ids)) {
      await Product.updateMany({ _id: { $in: ids } }, { $set: { status } });
    } else if (id) {
      await Product.findByIdAndUpdate(id, { $set: { status } });
    } else {
      return res.status(400).json({ error: 'Product id or ids array is required' });
    }

    broadcastCatalogChange(req);

    res.status(200).json({ message: 'Product status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle Bulk Product Operations (Delete, Category, Status, Price, Stock)
 */
const bulkOperations = async (req, res) => {
  try {
    const { ids, action, value } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of product IDs is required' });
    }
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    switch (action) {
      case 'delete': {
        // Fetch all selected products to delete their S3 image assets
        const products = await Product.find({ _id: { $in: ids } });
        const deletionPromises = [];

        products.forEach(p => {
          if (p.thumbnail) {
            deletionPromises.push(storageService.deleteFile(p.thumbnail).catch(() => {}));
          }
          if (p.images) {
            const imagesObj = p.images.toObject();
            for (const [_, val] of Object.entries(imagesObj)) {
              if (Array.isArray(val)) {
                val.forEach(file => {
                  if (file) deletionPromises.push(storageService.deleteFile(file).catch(() => {}));
                });
              } else if (val) {
                deletionPromises.push(storageService.deleteFile(val).catch(() => {}));
              }
            }
          }
        });

        await Promise.all(deletionPromises);
        await Product.deleteMany({ _id: { $in: ids } });
        break;
      }

      case 'category': {
        const catExists = await Category.findById(value);
        if (!catExists) {
          return res.status(400).json({ error: 'Invalid category reference' });
        }
        await Product.updateMany({ _id: { $in: ids } }, { $set: { category: value } });
        break;
      }

      case 'status': {
        if (!['Active', 'Inactive'].includes(value)) {
          return res.status(400).json({ error: 'Valid status must be Active or Inactive' });
        }
        await Product.updateMany({ _id: { $in: ids } }, { $set: { status: value } });
        break;
      }

      case 'price': {
        const { type, amount } = value; // type: set | percentage | fixed
        const amt = Number(amount);
        if (isNaN(amt)) {
          return res.status(400).json({ error: 'Amount must be a valid number' });
        }

        const products = await Product.find({ _id: { $in: ids } });
        for (const prod of products) {
          let newPrice = prod.price;
          if (type === 'percentage') {
            newPrice = prod.price * (1 + amt / 100);
          } else if (type === 'fixed') {
            newPrice = prod.price + amt;
          } else {
            newPrice = amt;
          }
          prod.price = Math.max(0, Math.round(newPrice));
          await prod.save();
        }
        break;
      }

      case 'stock': {
        const { type, amount } = value; // type: set | adjust
        const amt = Number(amount);
        if (isNaN(amt)) {
          return res.status(400).json({ error: 'Stock amount must be a valid number' });
        }

        const products = await Product.find({ _id: { $in: ids } });
        for (const prod of products) {
          let newStock = prod.stock;
          if (type === 'adjust') {
            newStock = prod.stock + amt;
          } else {
            newStock = amt;
          }
          prod.stock = Math.max(0, Math.round(newStock));
          prod.availability = prod.stock > 0 ? 'In Stock' : 'Out of Stock';
          await prod.save();
        }
        break;
      }

      default:
        return res.status(400).json({ error: `Unsupported bulk action: ${action}` });
    }

    broadcastCatalogChange(req);

    res.status(200).json({ message: `Bulk ${action} operation completed successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Direct search catalog proxy
 */
const searchProducts = async (req, res) => {
  req.query.limit = req.query.limit || 50;
  return getAllProducts(req, res);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  bulkOperations,
  searchProducts
};
