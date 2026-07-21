const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/cloud/s3');
const storageService = require('../services/storageService');
require('dotenv').config();

const Product = require('../models/Product/Product.model');
const Category = require('../models/Category/Category.model');
const Brand = require('../models/Brand/Brand.model');
const Material = require('../models/Material/Material.model');
const Color = require('../models/Color/Color.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mahaveer-smart-furniture-hub';
const REGION = process.env.AWS_REGION || 'us-east-1';

// Path to store sofa batch tracking information
const TRACKER_PATH = path.join(__dirname, 'sofa_batch_tracker.json');

// Local generated image files mapping for the first batch of 10 premium sofas
const FIRST_BATCH_IMAGES = [
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_wood_modern_1783770077833.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_metal_luxury_1783770090312.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_leather_fabric_1783770102674.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_fabric_leather_1783770139002.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_velvet_wooden_1783770151507.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_solid_wood_l_shape_1783770166817.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_engineered_wood_corner_1783770179746.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_steel_sectional_1783770217360.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_wood_chesterfield_1783770230092.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25\\sofa_stockholm_metal_loveseat_1783770241449.png'
];

/**
 * Deterministically generates all 350 unique sofa blueprints
 */
const generate350SofaBlueprints = () => {
  const blueprints = [];
  const DESIGN_NAMES = [
    'Stockholm', 'Napa', 'Denver', 'Copenhagen', 'Lisbon', 'Kyoto', 'Florence', 'Oslo', 'Vienna', 'Tokyo',
    'Munich', 'Milan', 'Helsinki', 'Dublin', 'Seattle', 'Boston', 'Phoenix', 'Austin', 'Portland', 'Vegas',
    'Orlando', 'Dallas', 'Miami', 'Aspen', 'Vail', 'Geneva', 'Zurich', 'Madrid', 'Barcelona', 'Paris',
    'London', 'Berlin', 'Rome', 'Prague', 'Athens'
  ]; // 35 names

  const BRANDS = ['Mahaveer', 'SmartCraft', 'WoodHaven', 'SteelVibe', 'LeatherLux', 'ComfortDesigns', 'RoyalLiving', 'UrbanStyle', 'ModaCasa', 'SleekStudio'];
  
  const TYPES = [
    'Modern Sofa', 'Luxury Sofa', 'Fabric Sofa', 'Leather Sofa', 'Wooden Sofa',
    'L Shape Sofa', 'Corner Sofa', 'Sectional Sofa', 'Chesterfield Sofa', 'Loveseat',
    '3 Seater Sofa', '2 Seater Sofa', 'Minimal Sofa', 'Scandinavian Sofa', 'Contemporary Sofa',
    'Classic Sofa', 'Recliner Sofa', 'Convertible Sofa', 'Compact Sofa', 'Premium Designer Sofa'
  ]; // 20 types

  const MATERIALS = ['Wood', 'Metal', 'Leather', 'Fabric', 'Velvet', 'Solid Wood', 'Engineered Wood', 'Steel']; // 8 materials
  const COLORS = ['Brown', 'Black', 'Grey', 'Blue', 'Cream', 'Beige', 'White', 'Walnut', 'Oak', 'Dark Walnut', 'Natural Wood', 'Charcoal']; // 12 colors

  let index = 1;
  
  for (let d = 0; d < DESIGN_NAMES.length; d++) {
    for (let t = 0; t < 10; t++) {
      const designName = DESIGN_NAMES[d];
      const typeIndex = (d * 10 + t) % TYPES.length;
      const sofaType = TYPES[typeIndex];

      const matIndex = (d * 10 + t) % MATERIALS.length;
      const materialName = MATERIALS[matIndex];

      const colIndex = (d * 10 + t) % COLORS.length;
      const colorName = COLORS[colIndex];

      const brandName = (index % 5 < 3) ? 'Mahaveer' : BRANDS[index % BRANDS.length];
      const styles = ['Modern', 'Luxury', 'Minimalist', 'Scandinavian', 'Contemporary', 'Classic', 'Chesterfield'];
      const styleName = styles[index % styles.length];

      const productName = `${brandName} ${designName} ${materialName} ${sofaType}`;

      let seatCapacity = 3;
      if (sofaType.includes('Loveseat') || sofaType.includes('2 Seater')) seatCapacity = 2;
      else if (sofaType.includes('3 Seater')) seatCapacity = 3;
      else if (sofaType.includes('L Shape') || sofaType.includes('Sectional') || sofaType.includes('Corner')) seatCapacity = 5;
      else seatCapacity = (index % 2 === 0) ? 3 : 4;

      const rooms = ['Living Room', 'Apartment', 'Lounge', 'Office', 'Bedroom'];
      const suitableRoom = rooms[index % rooms.length];

      let basePrice = 25000 + (index % 50) * 1500;
      if (materialName === 'Leather' || materialName === 'Velvet') basePrice += 15000;
      if (sofaType.includes('Sectional') || sofaType.includes('L Shape') || sofaType.includes('Corner')) basePrice += 20000;

      const matCode = materialName.substring(0, 2).toUpperCase();
      const colCode = colorName.substring(0, 2).toUpperCase();
      const sku = `MHV-SOFA-${matCode}-${colCode}-${String(index).padStart(4, '0')}`;

      blueprints.push({
        id: index,
        name: productName,
        sku: sku,
        brand: brandName,
        type: sofaType,
        material: materialName,
        primaryColor: colorName,
        style: styleName,
        price: basePrice,
        seatCapacity: seatCapacity,
        suitableRoom: suitableRoom,
        status: 'pending',
        s3Url: ''
      });

      index++;
    }
  }
  return blueprints;
};

/**
 * Ensures the required Material (Velvet) and Color (Charcoal) exist in the DB
 */
const initCustomAttributes = async () => {
  console.log('Checking and initializing Velvet material and Charcoal color...');
  
  let velvet = await Material.findOne({ slug: 'velvet' });
  if (!velvet) {
    velvet = await Material.create({ name: 'Velvet', slug: 'velvet' });
    console.log('Created Velvet material in DB.');
  }

  let charcoal = await Color.findOne({ slug: 'charcoal' });
  if (!charcoal) {
    charcoal = await Color.create({ name: 'Charcoal', slug: 'charcoal', hex: '#36454F' });
    console.log('Created Charcoal color in DB.');
  }
};

/**
 * Uploads a local image buffer to S3 after converting and compressing it via sharp
 */
const uploadToS3 = async (localPath, destKey) => {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    
    // Process image buffer using sharp (convert to WebP & compress)
    const processedBuffer = await sharp(fileBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    console.log(`Uploading processed WebP to S3: ${destKey}`);
    const params = {
      Bucket: BUCKET_NAME,
      Key: destKey,
      Body: processedBuffer,
      ContentType: 'image/webp'
    };
    
    await s3Client.send(new PutObjectCommand(params));
    
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${destKey}`;
  } catch (error) {
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
};

const runSeeder = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Initialize custom Velvet & Charcoal records
    await initCustomAttributes();

    // 2. Load category references
    const categoryDoc = await Category.findOne({ slug: 'sofa' });
    if (!categoryDoc) {
      throw new Error('Sofa category not found in DB! Seed categories first.');
    }
    const catId = categoryDoc._id;

    // 3. Load or generate the tracker file
    let tracker = [];
    if (fs.existsSync(TRACKER_PATH)) {
      console.log('Loading existing sofa tracker from:', TRACKER_PATH);
      tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    } else {
      console.log('Tracker file not found. Creating deterministic 350-sofa blueprints...');
      tracker = generate350SofaBlueprints();
      fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf8');
      console.log('Saved tracker file.');
    }

    // 4. Clean up existing sofas in category Sofa to refresh with correct material images
    console.log('Cleaning up all existing sofas in category Sofa to refresh S3 URLs...');
    const deleteResult = await Product.deleteMany({
      category: catId
    });
    console.log(`Deleted ${deleteResult.deletedCount} sofas.`);

    // 5. Check and upload the first batch of 10 sofas to get the base S3 images
    console.log('Checking and preparing base S3 images from first 10 sofas...');
    const completedUrls = [];

    for (let i = 0; i < 10; i++) {
      const sofaItem = tracker[i];
      if (!sofaItem) continue;

      let s3Url = sofaItem.s3Url;

      if (!s3Url) {
        const localImagePath = FIRST_BATCH_IMAGES[i];
        if (localImagePath && fs.existsSync(localImagePath)) {
          console.log(`Uploading S3 image for Sofa ${sofaItem.id}: ${sofaItem.name}`);
          const slugName = storageService.slugify(sofaItem.name);
          const s3Key = `products/sofa/${slugName}/thumbnail.webp`;
          s3Url = await uploadToS3(localImagePath, s3Key);
          sofaItem.s3Url = s3Url;
          sofaItem.status = 'completed';
          fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf8');
        } else {
          console.error(`Error: Local image not found for Sofa ${sofaItem.id}`);
        }
      }

      if (s3Url) {
        completedUrls.push(s3Url);
      }
    }

    if (completedUrls.length === 0) {
      throw new Error('No completed premium S3 URLs found. Please check image uploads first.');
    }

    console.log(`Available base S3 images: ${completedUrls.length}`);

    // 6. Ingest all 350 sofas into MongoDB
    console.log('Seeding all 350 premium sofas to database...');
    let seededCount = 0;
    let skippedCount = 0;

    const getS3UrlForMaterial = (materialName, index, urls) => {
      const mat = materialName.toLowerCase();
      if (mat === 'solid wood') {
        return urls[5]; // Solid Wood L Shape
      }
      if (mat === 'engineered wood') {
        return urls[6]; // Engineered Wood Corner
      }
      if (mat === 'wood') {
        return index % 2 === 0 ? urls[0] : urls[8]; // alternate Wood Modern / Chesterfield
      }
      if (mat === 'metal') {
        return index % 2 === 0 ? urls[1] : urls[9]; // alternate Metal Luxury / Loveseat
      }
      if (mat === 'steel') {
        return urls[7]; // Steel Sectional
      }
      if (mat === 'leather') {
        return urls[2]; // Leather Fabric
      }
      if (mat === 'fabric') {
        return urls[3]; // Fabric Leather
      }
      if (mat === 'velvet') {
        return urls[4]; // Velvet Wooden
      }
      return urls[index % urls.length];
    };

    for (let i = 0; i < tracker.length; i++) {
      const sofaItem = tracker[i];
      
      let s3Url;
      if (i < 10) {
        s3Url = completedUrls[i];
      } else {
        s3Url = getS3UrlForMaterial(sofaItem.material, i, completedUrls);
      }
      sofaItem.s3Url = s3Url;
      sofaItem.status = 'completed';
      
      const dbS3Url = s3Url ? `${s3Url}?v=${Date.now()}` : s3Url;

      // Check if product with this SKU already exists (in case of double run without delete)
      const existingProduct = await Product.findOne({ sku: sofaItem.sku });
      if (existingProduct) {
        skippedCount++;
        continue;
      }

      // Find or create brand
      const brandDoc = await Brand.findOneAndUpdate(
        { slug: storageService.slugify(sofaItem.brand) },
        { name: sofaItem.brand, slug: storageService.slugify(sofaItem.brand), description: `${sofaItem.brand} premium furniture brand` },
        { upsert: true, new: true }
      );

      const materialDoc = await Material.findOne({ slug: storageService.slugify(sofaItem.material) });
      if (!materialDoc) {
        throw new Error(`Material "${sofaItem.material}" not found!`);
      }

      const colorDoc = await Color.findOne({ slug: storageService.slugify(sofaItem.primaryColor) });
      if (!colorDoc) {
        throw new Error(`Color "${sofaItem.primaryColor}" not found!`);
      }

      const description = `The ${sofaItem.name} is a masterpiece created by ${sofaItem.brand}. Upholstered in premium quality ${sofaItem.material.toLowerCase()}, this ${sofaItem.type.toLowerCase()} features a beautiful ${sofaItem.primaryColor.toLowerCase()} finish that suits any modern ${sofaItem.suitableRoom.toLowerCase()}. Designed for maximum comfort, it offers a seat capacity of ${sofaItem.seatCapacity} and fits beautifully in commercial or home luxury environments.`;
      
      const dimensions = `${180 + (sofaItem.id % 40)}cm x ${85 + (sofaItem.id % 15)}cm x ${88 + (sofaItem.id % 8)}cm`;
      const rating = parseFloat((4.5 + (sofaItem.id % 6) * 0.1).toFixed(1));
      const reviewCount = 15 + (sofaItem.id % 80);
      const stock = 10 + (sofaItem.id % 45);

      const productPayload = {
        name: sofaItem.name,
        sku: sofaItem.sku,
        brand: brandDoc._id,
        category: catId,
        subcategory: sofaItem.type,
        price: sofaItem.price,
        discountPrice: Math.floor(sofaItem.price * 0.85),
        stock: stock,
        material: materialDoc._id,
        color: colorDoc._id,
        dimensions: dimensions,
        weight: 45 + (sofaItem.id % 30),
        warranty: `${2 + (sofaItem.id % 2)} Year Warranty`,
        description: description,
        features: [
          'Premium commercial furniture grade upholstery',
          'Solid frame with reinforcement for sag-free comfort',
          'Handcrafted detailing and elegant modern styling',
          'Easy-to-clean stain-resistant luxury materials',
          'Heavy-duty support structures with protective feet pads'
        ],
        careInstructions: `Regularly vacuum clean using a soft brush attachment. Keep away from excessive moisture, heat, or direct sunlight. Clean stains immediately with a dry cloth.`,
        assemblyRequired: true,
        availability: 'In Stock',
        rating: rating,
        reviewCount: reviewCount,
        thumbnail: dbS3Url,
        images: {
          front: dbS3Url,
          side: dbS3Url,
          back: dbS3Url,
          lifestyle: dbS3Url
        }
      };

      await Product.create(productPayload);
      seededCount++;
    }

    // Save updated tracker state
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf8');

    console.log(`\nSofa seeding completed. Seeded: ${seededCount}, Skipped/Existing: ${skippedCount}.`);
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during sofa seeding:', error);
    process.exit(1);
  }
};

runSeeder();
