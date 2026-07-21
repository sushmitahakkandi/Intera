const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Product = require('../../models/Product/Product.model');
const Category = require('../../models/Category/Category.model');
const Brand = require('../../models/Brand/Brand.model');
const Material = require('../../models/Material/Material.model');
const Color = require('../../models/Color/Color.model');
const ImportHistory = require('../../models/ImportHistory/ImportHistory.model');
const storageService = require('../../services/storageService');
const { Readable } = require('stream');
const csvParser = require('csv-parser');

const TEMP_DIR = path.join(__dirname, '../../temp_imports');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Helper: Find or create Category, Brand, Material, Color by name
 */
const findOrCreateRelations = async (row, session = null) => {
  const brandName = (row.brand || 'Generic').trim();
  const categoryName = (row.category || 'Furniture').trim();
  const materialName = (row.material || 'Wood').trim();
  const colorName = (row.color || 'Natural Wood').trim();
  const colorHex = (row.colorHex || '#A66A2C').trim();

  const brandSlug = storageService.slugify(brandName);
  const catSlug = storageService.slugify(categoryName);
  const matSlug = storageService.slugify(materialName);
  const colSlug = storageService.slugify(colorName);

  const opt = session ? { session } : {};

  // Find or create Category
  let catDoc = await Category.findOne({ slug: catSlug }).session(session);
  let isNewCategory = false;
  if (!catDoc) {
    catDoc = new Category({
      name: categoryName,
      slug: catSlug,
      description: `${categoryName} category auto-created during import.`
    });
    await catDoc.save(opt);
    isNewCategory = true;
  }

  // Find or create Brand
  let brandDoc = await Brand.findOne({ slug: brandSlug }).session(session);
  if (!brandDoc) {
    brandDoc = new Brand({ name: brandName, slug: brandSlug });
    await brandDoc.save(opt);
  }

  // Find or create Material
  let matDoc = await Material.findOne({ slug: matSlug }).session(session);
  if (!matDoc) {
    matDoc = new Material({ name: materialName, slug: matSlug });
    await matDoc.save(opt);
  }

  // Find or create Color
  let colDoc = await Color.findOne({ slug: colSlug }).session(session);
  if (!colDoc) {
    colDoc = new Color({ name: colorName, slug: colSlug, hex: colorHex });
    await colDoc.save(opt);
  }

  return {
    brandId: brandDoc._id,
    categoryId: catDoc._id,
    materialId: matDoc._id,
    colorId: colDoc._id,
    categorySlug: catSlug,
    isNewCategory
  };
};

/**
 * Helper: Parse list string to array
 */
const parseFeatures = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.toString().split(',').map(s => s.trim()).filter(Boolean);
};

/**
 * Helper: Parse input data from request
 */
const parseFileData = async (file) => {
  const extension = path.extname(file.originalname).toLowerCase();
  let list = [];

  if (extension === '.json') {
    list = JSON.parse(file.buffer.toString());
  } else if (extension === '.csv') {
    // Parse using xlsx which is highly robust for CSV files in memory buffers
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    list = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } else if (extension === '.xlsx' || extension === '.xls') {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    list = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } else {
    throw new Error('Unsupported file format. Please upload CSV, Excel or JSON.');
  }

  if (!Array.isArray(list)) {
    throw new Error('Parsed content is not an array.');
  }

  return list;
};

/**
 * POST /api/bulk/validate-file
 */
const validateFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No import file provided.' });
    }

    const rawRows = await parseFileData(req.file);
    const totalRows = rawRows.length;

    const errors = [];
    const warnings = [];
    const validRows = [];
    const seenSkusInFile = new Set();
    const seenNamesInFile = new Set();

    // Pull current DB SKUs and Names to check duplicates
    const existingProducts = await Product.find({}, 'sku name');
    const existingSkus = new Set(existingProducts.map(p => p.sku));
    const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()));

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const rowNum = index + 2; // Excel/CSV header is line 1, row 1 is line 2
      const name = (row.name || '').toString().trim();
      let sku = (row.sku || '').toString().trim();

      const itemErrors = [];
      const itemWarnings = [];

      // Generate SKU if missing
      if (!sku) {
        const catCode = storageService.slugify(row.category || 'GEN').substring(0, 3).toUpperCase();
        const rand = Math.floor(1000 + Math.random() * 9000);
        sku = `MHV-${catCode}-${rand}`;
        itemWarnings.push(`SKU was missing; auto-generated: ${sku}`);
      }

      // Check duplicate SKU in file
      if (seenSkusInFile.has(sku)) {
        itemErrors.push(`Duplicate SKU "${sku}" detected within this import file.`);
      }
      seenSkusInFile.add(sku);

      // Check duplicate product name in file
      if (name) {
        if (seenNamesInFile.has(name.toLowerCase())) {
          itemErrors.push(`Duplicate Product Name "${name}" detected within this import file.`);
        }
        seenNamesInFile.add(name.toLowerCase());
      } else {
        itemErrors.push('Product name is required.');
      }

      // Validate pricing
      const price = Number(row.price);
      if (isNaN(price) || price < 0) {
        itemErrors.push(`Invalid price "${row.price}". Must be a number >= 0.`);
      }

      const discountPrice = Number(row.discountPrice || 0);
      if (isNaN(discountPrice) || discountPrice < 0) {
        itemErrors.push(`Invalid discountPrice "${row.discountPrice}". Must be a number >= 0.`);
      } else if (discountPrice > price) {
        itemErrors.push(`Discount price (${discountPrice}) cannot be greater than base price (${price}).`);
      }

      // Validate stock
      const stock = Number(row.stock || 0);
      if (isNaN(stock) || stock < 0) {
        itemErrors.push(`Invalid stock quantity "${row.stock}". Must be an integer >= 0.`);
      }

      // Warnings for categories and relations
      if (!row.category) {
        itemWarnings.push('Missing category. Will fallback to default category "Furniture".');
      }
      if (!row.material) {
        itemWarnings.push('Missing material. Will fallback to default material "Wood".');
      }
      if (!row.color) {
        itemWarnings.push('Missing color. Will fallback to default color "Natural Wood".');
      }

      // Warnings for images
      if (!row.thumbnail && !row.imageFront) {
        itemWarnings.push('Missing product image path/filename. Product will load with placeholder graphics.');
      }

      // Check database duplicates
      if (existingSkus.has(sku)) {
        itemWarnings.push(`SKU "${sku}" matches an existing product in MongoDB and will perform an UPDATE/OVERWRITE operation.`);
      }
      if (name && existingNames.has(name.toLowerCase()) && !existingSkus.has(sku)) {
        itemWarnings.push(`Product name "${name}" matches an existing product with a different SKU in DB. Verify if this is intended.`);
      }

      // Build row review item
      const reviewRow = {
        ...row,
        sku,
        name,
        price: isNaN(price) ? 0 : price,
        discountPrice: isNaN(discountPrice) ? 0 : discountPrice,
        stock: isNaN(stock) ? 0 : stock
      };

      if (itemErrors.length > 0) {
        errors.push({
          row: rowNum,
          sku,
          name,
          error: itemErrors.join(' | ')
        });
      } else {
        validRows.push(reviewRow);
      }

      if (itemWarnings.length > 0) {
        warnings.push({
          row: rowNum,
          sku,
          name,
          warning: itemWarnings.join(' | ')
        });
      }
    }

    // Cache valid records to workspace temp directory
    const importTaskId = `import_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const cacheFilePath = path.join(TEMP_DIR, `${importTaskId}.json`);
    fs.writeFileSync(cacheFilePath, JSON.stringify({
      fileName: req.file.originalname,
      rows: validRows
    }, null, 2));

    res.status(200).json({
      importTaskId,
      fileName: req.file.originalname,
      totalRows,
      estimatedProducts: validRows.length,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      errors,
      warnings,
      // Provide first 20 records for user preview
      preview: validRows.slice(0, 20)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/bulk/execute-import
 */
const executeImport = async (req, res) => {
  const { importTaskId, bypassWarnings = true } = req.body;
  if (!importTaskId) {
    return res.status(400).json({ error: 'Import Task ID is required.' });
  }

  const cacheFilePath = path.join(TEMP_DIR, `${importTaskId}.json`);
  if (!fs.existsSync(cacheFilePath)) {
    return res.status(404).json({ error: 'Import cache expired or not found. Please upload file again.' });
  }

  const io = req.app.get('io');
  const adminName = req.user?.name || 'Administrator';
  const startTime = Date.now();

  // Load from cache
  const taskData = JSON.parse(fs.readFileSync(cacheFilePath));
  const rows = taskData.rows;
  const fileName = taskData.fileName;

  // Audit and Rollback states
  const createdProductIds = [];
  const createdCategoryIds = [];
  const createdBrandIds = [];
  const createdMaterialIds = [];
  const createdColorIds = [];
  const uploadedS3Keys = [];
  const errorDetails = [];
  const auditLogs = [];

  let successImportCount = 0;
  let successUpdateCount = 0;
  let categoriesCreatedCount = 0;
  let skippedCount = 0;

  const emitProgress = (step, progressPercent, currentProduct = '', estRemaining = 'Calculating...') => {
    if (io) {
      io.emit('import_progress', {
        taskId: importTaskId,
        step,
        progress: progressPercent,
        currentProduct,
        estimatedTime: estRemaining
      });
    }
  };

  auditLogs.push(`[${new Date().toISOString()}] Import task started by ${adminName}`);
  emitProgress('Reading File', 10, '', 'Calculating...');

  // Start execution wrapper
  const runImport = async () => {
    try {
      const totalCount = rows.length;

      for (let i = 0; i < totalCount; i++) {
        const row = rows[i];
        const pct = Math.round(15 + (i / totalCount) * 80);
        const timeElapsed = (Date.now() - startTime) / 1000;
        const avgTimePerItem = timeElapsed / (i + 1);
        const estRemainingSec = Math.round(avgTimePerItem * (totalCount - (i + 1)));
        const estRemainingStr = estRemainingSec > 60 
          ? `${Math.round(estRemainingSec / 60)}m ${estRemainingSec % 60}s` 
          : `${estRemainingSec}s`;

        emitProgress('Creating Products', pct, row.name, estRemainingStr);

        try {
          // Provision relations
          const relations = await findOrCreateRelations(row);
          if (relations.isNewCategory) {
            createdCategoryIds.push(relations.categoryId);
            categoriesCreatedCount++;
            auditLogs.push(`Created Category: ${row.category}`);
          }

          const existingProduct = await Product.findOne({ sku: row.sku });

          const productPayload = {
            name: row.name.trim(),
            sku: row.sku.trim(),
            brand: relations.brandId,
            category: relations.categoryId,
            subcategory: row.subcategory || 'General',
            price: Number(row.price) || 0,
            discountPrice: Number(row.discountPrice) || 0,
            stock: Number(row.stock) || 0,
            material: relations.materialId,
            color: relations.colorId,
            dimensions: row.dimensions || 'N/A',
            weight: Number(row.weight || 10),
            warranty: row.warranty || '1 Year Warranty',
            description: row.description || `${row.name} description.`,
            features: parseFeatures(row.features),
            careInstructions: row.careInstructions || 'Wipe with a clean dry cloth.',
            assemblyRequired: String(row.assemblyRequired).toLowerCase() === 'true',
            availability: Number(row.stock) > 0 ? 'In Stock' : 'Out of Stock',
            isNewArrival: String(row.isNewArrival).toLowerCase() === 'true' || String(row.tag).toLowerCase() === 'new',
            isTrending: String(row.isTrending).toLowerCase() === 'true',
            isFeatured: String(row.isFeatured).toLowerCase() === 'true',
            isBestSeller: String(row.isBestSeller).toLowerCase() === 'true',
            isAIEligible: String(row.isAIEligible).toLowerCase() === 'true',
            rating: Number(row.rating) || 5.0,
            reviewCount: Number(row.reviewCount) || 0,
            // Fallback thumbnail / images path structure
            thumbnail: row.thumbnail || `products/${relations.categorySlug}/${storageService.slugify(row.name)}/thumbnail.webp`,
            images: {
              front: row.imageFront || `products/${relations.categorySlug}/${storageService.slugify(row.name)}/front.webp`,
              side: row.imageSide || `products/${relations.categorySlug}/${storageService.slugify(row.name)}/side.webp`,
              back: row.imageBack || `products/${relations.categorySlug}/${storageService.slugify(row.name)}/back.webp`,
              top: row.imageTop || `products/${relations.categorySlug}/${storageService.slugify(row.name)}/top.webp`,
              lifestyle: row.imageLifestyle || `products/${relations.categorySlug}/${storageService.slugify(row.name)}/lifestyle.webp`,
              materialCloseUp: row.imageMaterial || `products/${relations.categorySlug}/${storageService.slugify(row.name)}/material.webp`,
              dimensionImage: row.imageDimension || `products/${relations.categorySlug}/${storageService.slugify(row.name)}/dimension.webp`
            }
          };

          if (existingProduct) {
            // Update operation
            await Product.findByIdAndUpdate(existingProduct._id, productPayload, { runValidators: true });
            successUpdateCount++;
            auditLogs.push(`Updated Product SKU: ${row.sku}`);
          } else {
            // Insert operation
            const newProd = new Product(productPayload);
            const saved = await newProd.save();
            createdProductIds.push(saved._id);
            successImportCount++;
            auditLogs.push(`Imported Product SKU: ${row.sku}`);
          }

        } catch (err) {
          skippedCount++;
          errorDetails.push({
            sku: row.sku || 'Unknown',
            name: row.name || 'Unknown',
            error: err.message
          });
          auditLogs.push(`Failed to import Product SKU ${row.sku}: ${err.message}`);
        }

        // Yield control back to event loop to keep dev server responsive
        await new Promise(resolve => setImmediate(resolve));
      }

      // Check if import succeeded completely or partially
      if (successImportCount === 0 && successUpdateCount === 0 && skippedCount > 0) {
        throw new Error('All records failed to import.');
      }

      emitProgress('Finalizing', 98, 'Saving database report...', '0s');

      // Create history record
      const history = new ImportHistory({
        fileName,
        adminName,
        productsImported: successImportCount,
        productsUpdated: successUpdateCount,
        categoriesCreated: categoriesCreatedCount,
        skippedProducts: skippedCount,
        timeTaken: Math.round((Date.now() - startTime) / 1000),
        status: 'Success',
        errorDetails,
        auditLogs
      });
      await history.save();

      // Clean task cache file
      if (fs.existsSync(cacheFilePath)) {
        fs.unlinkSync(cacheFilePath);
      }

      emitProgress('Finalizing', 100, 'Done!', '0s');

      // Global socket event update
      if (io) {
        io.emit('catalog_changed');
      }

      return res.status(200).json({
        message: 'Import execution completed successfully.',
        report: history
      });

    } catch (err) {
      // Rollback database updates
      auditLogs.push(`[${new Date().toISOString()}] Rollback initiated due to error: ${err.message}`);
      emitProgress('Finalizing', 100, 'Rolling back transaction...', '0s');

      // Delete inserted products
      if (createdProductIds.length > 0) {
        await Product.deleteMany({ _id: { $in: createdProductIds } });
        auditLogs.push(`Rolled back ${createdProductIds.length} inserted products.`);
      }

      // Delete auto-created categories
      if (createdCategoryIds.length > 0) {
        await Category.deleteMany({ _id: { $in: createdCategoryIds } });
      }

      // Save failure record in logs
      const history = new ImportHistory({
        fileName,
        adminName,
        productsImported: 0,
        productsUpdated: 0,
        categoriesCreated: 0,
        skippedProducts: rows.length,
        timeTaken: Math.round((Date.now() - startTime) / 1000),
        status: 'Failed',
        errorDetails: [{ error: err.message }, ...errorDetails],
        auditLogs
      });
      await history.save();

      // Clean cache file
      if (fs.existsSync(cacheFilePath)) {
        fs.unlinkSync(cacheFilePath);
      }

      return res.status(500).json({
        error: `Import failed: ${err.message}. Database has been rolled back safely.`,
        report: history
      });
    }
  };

  // Run async
  runImport();
};

/**
 * POST /api/bulk/map-images
 */
const bulkImageMapping = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded for mapping.' });
    }

    const results = { success: [], failed: [] };
    const io = req.app.get('io');

    for (let idx = 0; idx < req.files.length; idx++) {
      const file = req.files[idx];
      try {
        const originalName = file.originalname;
        const extension = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, extension);

        // Detect SKU and View type
        let sku, viewType;
        if (nameWithoutExt.includes('_')) {
          const parts = nameWithoutExt.split('_');
          viewType = parts.pop().toLowerCase();
          sku = parts.join('_');
        } else if (nameWithoutExt.includes('-')) {
          const parts = nameWithoutExt.split('-');
          viewType = parts.pop().toLowerCase();
          sku = parts.join('-');
        } else {
          throw new Error('Filename must contain an underscore (_) or hyphen (-) separator for SKU and view type');
        }

        // Standardize views
        const validViews = ['front', 'side', 'left', 'right', 'back', 'top', 'bottom', 'lifestyle', 'material', 'dimension', 'dimensions', 'thumbnail', '360'];
        if (!validViews.includes(viewType)) {
          throw new Error(`Invalid view type "${viewType}". Must be one of: ${validViews.join(', ')}`);
        }

        // Find matching product
        const product = await Product.findOne({ sku: sku }).populate('category');
        if (!product) {
          throw new Error(`Product with SKU "${sku}" not found in database.`);
        }

        const categorySlug = product.category.slug;
        
        // S3 Folder structure: products/category/sku/viewType
        const s3Folder = `products/${categorySlug}/${sku}/${viewType}`;

        const uploadResult = await storageService.uploadImage(file, s3Folder, {
          baseName: product.name,
          viewType: viewType
        });

        // Map schema field
        const schemaViewMap = {
          front: 'images.front',
          side: 'images.side',
          left: 'images.side',
          right: 'images.side',
          back: 'images.back',
          top: 'images.top',
          lifestyle: 'images.lifestyle',
          material: 'images.materialCloseUp',
          dimension: 'images.dimensionImage',
          dimensions: 'images.dimensionImage',
          thumbnail: 'thumbnail'
        };

        const targetField = schemaViewMap[viewType];
        const updateObj = {};

        if (targetField) {
          updateObj[targetField] = uploadResult.key;
        } else if (viewType === '360') {
          // Push to array
          updateObj['$push'] = { 'images.images360': uploadResult.key };
        } else {
          // Push other custom views to gallery
          updateObj['$push'] = { 'images.gallery': uploadResult.key };
        }

        if (targetField) {
          await Product.findOneAndUpdate({ sku: sku }, { $set: updateObj });
        } else {
          await Product.findOneAndUpdate({ sku: sku }, updateObj);
        }

        results.success.push({
          fileName: originalName,
          sku: sku,
          viewType: viewType,
          dbPath: uploadResult.key
        });

      } catch (err) {
        results.failed.push({
          fileName: file.originalname,
          error: err.message
        });
      }
    }

    // Trigger dashboard update
    if (io) {
      io.emit('catalog_changed');
    }

    res.status(200).json({
      message: 'Bulk image mapping completed',
      data: results
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/bulk/bulk-update
 */
const bulkUpdate = async (req, res) => {
  try {
    const { productIds, action, value } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Product IDs array is required.' });
    }

    const io = req.app.get('io');
    let updatedCount = 0;

    if (action === 'delete') {
      await Product.deleteMany({ _id: { $in: productIds } });
      updatedCount = productIds.length;
    } else {
      const updatePayload = {};

      switch (action) {
        case 'price':
          const priceVal = Number(value.amount);
          if (isNaN(priceVal)) throw new Error('Invalid price amount.');

          if (value.type === 'set') {
            updatePayload.price = priceVal;
          } else if (value.type === 'add') {
            await Product.updateMany({ _id: { $in: productIds } }, { $inc: { price: priceVal } });
            updatedCount = productIds.length;
          } else if (value.type === 'multiply') {
            const productsToMul = await Product.find({ _id: { $in: productIds } });
            for (const p of productsToMul) {
              p.price = Math.round(p.price * priceVal);
              await p.save();
            }
            updatedCount = productIds.length;
          }
          break;

        case 'stock':
          const stockVal = Number(value.amount);
          if (isNaN(stockVal)) throw new Error('Invalid stock amount.');

          if (value.type === 'set') {
            updatePayload.stock = stockVal;
            updatePayload.availability = stockVal > 0 ? 'In Stock' : 'Out of Stock';
          } else if (value.type === 'add') {
            // Need to update availability after incrementing
            const productsToIncStock = await Product.find({ _id: { $in: productIds } });
            for (const p of productsToIncStock) {
              p.stock = Math.max(0, p.stock + stockVal);
              p.availability = p.stock > 0 ? 'In Stock' : 'Out of Stock';
              await p.save();
            }
            updatedCount = productIds.length;
          }
          break;

        case 'category':
          updatePayload.category = value;
          break;
        case 'material':
          updatePayload.material = value;
          break;
        case 'color':
          updatePayload.color = value;
          break;
        case 'status':
          updatePayload.status = value;
          break;
        case 'warranty':
          updatePayload.warranty = value;
          break;
        case 'dimensions':
          updatePayload.dimensions = value;
          break;
        default:
          return res.status(400).json({ error: `Invalid update action "${action}"` });
      }

      if (Object.keys(updatePayload).length > 0) {
        const result = await Product.updateMany({ _id: { $in: productIds } }, { $set: updatePayload });
        updatedCount = result.modifiedCount;
      }
    }

    if (io) {
      io.emit('catalog_changed');
    }

    res.status(200).json({
      message: `Successfully executed bulk ${action} on ${updatedCount} products.`,
      updatedCount
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/bulk/export
 */
const exportProducts = async (req, res) => {
  try {
    const { format = 'csv', productIds, search, sku, category, material, color } = req.query;

    const filter = {};

    if (productIds) {
      filter._id = { $in: productIds.split(',') };
    } else {
      if (search) filter.name = { $regex: search, $options: 'i' };
      if (sku) filter.sku = { $regex: sku, $options: 'i' };
      if (category) filter.category = category;
      if (material) filter.material = material;
      if (color) filter.color = color;
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('material', 'name')
      .populate('color', 'name');

    // Format fields for tabular output
    const rows = products.map(p => ({
      name: p.name,
      sku: p.sku,
      brand: p.brand?.name || 'Generic',
      category: p.category?.name || 'Furniture',
      subcategory: p.subcategory || 'General',
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      material: p.material?.name || 'Wood',
      color: p.color?.name || 'Natural Wood',
      dimensions: p.dimensions,
      weight: p.weight,
      warranty: p.warranty,
      description: p.description,
      features: p.features.join(', '),
      careInstructions: p.careInstructions,
      assemblyRequired: p.assemblyRequired ? 'TRUE' : 'FALSE',
      status: p.status
    }));

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.attachment('products_export.json');
      return res.send(JSON.stringify(rows, null, 2));
    }

    // Generate Excel Workbook buffer using SheetJS
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, 'Products');

    if (format === 'csv') {
      const csvContent = xlsx.utils.sheet_to_csv(ws);
      res.setHeader('Content-Type', 'text/csv');
      res.attachment('products_export.csv');
      return res.send(csvContent);
    }

    // Default Excel (.xlsx) download
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('products_export.xlsx');
    return res.send(buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/bulk/history
 */
const getImportHistory = async (req, res) => {
  try {
    const list = await ImportHistory.find({}).sort({ importDate: -1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/bulk/history/:id/report
 */
const downloadImportReport = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await ImportHistory.findById(id);
    if (!history) {
      return res.status(404).json({ error: 'Import report not found.' });
    }

    // Format errors for report sheet
    const errorRows = history.errorDetails.map(err => ({
      SKU: err.sku,
      Name: err.name,
      'Error Detail': err.error
    }));

    const auditRows = history.auditLogs.map(log => ({
      TimestampedLog: log
    }));

    const wb = xlsx.utils.book_new();
    
    const wsErrors = xlsx.utils.json_to_sheet(errorRows.length > 0 ? errorRows : [{ SKU: 'N/A', Name: 'N/A', 'Error Detail': 'No validation errors occurred during this import.' }]);
    xlsx.utils.book_append_sheet(wb, wsErrors, 'Import Errors');

    const wsAudit = xlsx.utils.json_to_sheet(auditRows.length > 0 ? auditRows : [{ TimestampedLog: 'No logs generated.' }]);
    xlsx.utils.book_append_sheet(wb, wsAudit, 'Execution Audit Log');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`import_report_${history._id}.xlsx`);
    res.send(buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Legacy API endpoints
const importJSON = async (req, res) => {
  try {
    const list = req.body;
    const cacheTaskId = `legacy_${Date.now()}`;
    const cacheFilePath = path.join(TEMP_DIR, `${cacheTaskId}.json`);
    fs.writeFileSync(cacheFilePath, JSON.stringify({ fileName: 'legacy_import.json', rows: list }));
    
    req.body = { importTaskId: cacheTaskId };
    return executeImport(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const importCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No CSV file provided.' });
    return validateFile(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const importExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No Excel file provided.' });
    return validateFile(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  validateFile,
  executeImport,
  bulkImageMapping,
  bulkUpdate,
  exportProducts,
  getImportHistory,
  downloadImportReport,
  importJSON,
  importCSV,
  importExcel
};
