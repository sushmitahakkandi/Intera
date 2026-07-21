const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product/Product.model');
const Category = require('../models/Category/Category.model');
const Brand = require('../models/Brand/Brand.model');
const Material = require('../models/Material/Material.model');
const Color = require('../models/Color/Color.model');
const storageService = require('../services/storageService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';

const BRANDS = ['Mahaveer', 'SmartCraft', 'WoodHaven', 'SteelVibe', 'LeatherLux', 'ComfortDesigns', 'RoyalLiving', 'UrbanStyle', 'ModaCasa', 'SleekStudio'];
const MATERIALS = ['Wood', 'Metal', 'Leather', 'Fabric', 'Engineered Wood', 'Solid Wood', 'Steel', 'Glass'];
const COLORS = [
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Walnut', hex: '#5C4033' },
  { name: 'Oak', hex: '#B8860B' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Natural Wood', hex: '#D2B48C' },
  { name: 'Dark Walnut', hex: '#3D2314' }
];

const CATEGORY_COUNTS = {
  Sofa: 450,
  Chair: 400,
  Bed: 400,
  Dining: 350,
  Tables: 450,
  Storage: 450
};

const ADJECTIVES = ['Classic', 'Modern', 'Minimalist', 'Scandinavian', 'Chesterfield', 'Luxurious', 'Industrial', 'Mid-Century', 'Rustic', 'Contemporary', 'Vintage', 'Art Deco', 'Ergonomic', 'Plush', 'Velvet', 'Tufted', 'Sleek', 'Cozy', 'Royal', 'Nordic', 'Aero', 'Imperial', 'Aura', 'Heritage', 'Elite'];
const DESIGN_NAMES = ['Stockholm', 'Napa', 'Denver', 'Copenhagen', 'Lisbon', 'Kyoto', 'Florence', 'Oslo', 'Vienna', 'Tokyo', 'Munich', 'Milan', 'Helsinki', 'Dublin', 'Seattle', 'Boston', 'Phoenix', 'Austin', 'Portland', 'Vegas', 'Orlando', 'Dallas', 'Miami', 'Aspen', 'Vail'];

const CATEGORIES_DATA = {
  Sofa: {
    subcategories: ['Chesterfield Sofa', 'Sectional Sofa', 'Loveseat', 'L-shaped Sofa', 'Sofa Bed', 'Recliner Sofa', 'Fabric Sofa', 'Leather Sofa'],
    minPrice: 15000, maxPrice: 85000,
    minWeight: 35, maxWeight: 95,
    dimTemplate: (i) => `${200 + (i % 40)}cm x ${80 + (i % 15)}cm x ${85 + (i % 10)}cm`,
    features: [
      'High density foam seat cushions for sag-free comfort',
      'Sturdy kiln-dried solid wood frame construction',
      'Upholstered in stain-resistant premium grade fabric',
      'Tufted back and rolled armrests for an elegant classic aesthetic',
      'Heavy-duty solid wood tapered legs with floor protectors'
    ],
    care: 'Vacuum clean regularly using soft brush attachment. Protect from direct heat or prolonged sunlight. Professional deep clean for stubborn stains.',
    assembly: true
  },
  Chair: {
    subcategories: ['Accent Chair', 'Office Chair', 'Recliner Chair', 'Armchair', 'Bar Stool', 'Lounge Chair', 'Dining Chair', 'Folding Chair'],
    minPrice: 2500, maxPrice: 28000,
    minWeight: 5, maxWeight: 22,
    dimTemplate: (i) => `${60 + (i % 15)}cm x ${58 + (i % 12)}cm x ${95 + (i % 25)}cm`,
    features: [
      'Ergonomically contoured seat and lumbar-supportive backrest',
      'Reinforced frame supporting up to 130kg load capacity',
      '360-degree swivel mechanism with gas lift height adjustment',
      'Breathable mesh fabric back preventing heat build-up',
      'Padded armrests with soft PU pads for arm comfort'
    ],
    care: 'Wipe down regularly with a dry microfibre cloth. Wipe metal components with chrome-cleaner. Avoid harsh chemical cleaners.',
    assembly: false
  },
  Bed: {
    subcategories: ['King Size Bed', 'Queen Size Bed', 'Double Bed', 'Single Bed', 'Bunk Bed', 'Daybed', 'Hydraulic Storage Bed', 'Platform Bed'],
    minPrice: 18000, maxPrice: 95000,
    minWeight: 55, maxWeight: 130,
    dimTemplate: (i) => `${210 + (i % 10)}cm x ${160 + (i % 30)}cm x ${110 + (i % 20)}cm`,
    features: [
      'Upholstered premium wingback headboard with thick padding',
      'Built-in smooth hydraulic lift storage system for extra bedding',
      'Sturdy engineered wood slatted base for mattress ventilation',
      'Heavy duty metal frame joints ensuring squeak-free sleeping',
      'Beautiful walnut-laminate scratch-resistant panel styling'
    ],
    care: 'Dust wood parts with a dry cloth. Clean headboard fabric upholstery with mild foam cleaner. Do not jump on the bed structure.',
    assembly: true
  },
  Dining: {
    subcategories: ['4-Seater Dining Set', '6-Seater Dining Set', 'Dining Table', 'Dining Bench', 'Bar Table Set', 'Marble Top Dining Set'],
    minPrice: 12000, maxPrice: 80000,
    minWeight: 30, maxWeight: 90,
    dimTemplate: (i) => `${150 + (i % 40)}cm x ${85 + (i % 15)}cm x ${76 + (i % 3)}cm`,
    features: [
      'Heat and scratch resistant laminated table surface',
      'Premium rubberwood solid legs for solid stance',
      'Comes with ergonomic chairs featuring cushioned seats',
      'Warm melamine veneer coating for easy spill wipe-downs',
      'Reinforced support beams underneath tabletop'
    ],
    care: 'Always use trivets, table runners, or coasters for hot plates and wet drinks. Wipe spills immediately. Avoid wet scouring pads.',
    assembly: true
  },
  Tables: {
    subcategories: ['Coffee Table', 'End Table', 'Console Table', 'Study Table', 'Nightstand', 'Nesting Tables', 'Laptop Table'],
    minPrice: 3000, maxPrice: 25000,
    minWeight: 8, maxWeight: 35,
    dimTemplate: (i) => `${100 + (i % 50)}cm x ${55 + (i % 20)}cm x ${46 + (i % 15)}cm`,
    features: [
      'Dual-tiered design featuring spacious lower storage shelf',
      'Premium tempered glass or solid top panel options',
      'Sleek industrial metal frame with protective powder coating',
      'Smooth glide pull-out drawers with decorative metal pull knobs',
      'Compact silhouette ideal for living rooms or bedrooms'
    ],
    care: 'Clean glass surfaces with vinegar and newspaper. Treat wood surfaces with beeswax polish. Wipe legs with damp cloth.',
    assembly: false
  },
  Storage: {
    subcategories: ['Wardrobe', 'Bookshelf', 'Sideboard', 'Chest of Drawers', 'Shoe Rack', 'TV Unit', 'Crockery Unit', 'Wall Cabinet'],
    minPrice: 5000, maxPrice: 55000,
    minWeight: 25, maxWeight: 95,
    dimTemplate: (i) => `${110 + (i % 80)}cm x ${42 + (i % 10)}cm x ${150 + (i % 70)}cm`,
    features: [
      'Ample internal shelving with adjustable configurations',
      'Integrated heavy-duty metal wardrobe clothing rods',
      'European soft-closing cabinet door hinges',
      'Anti-tipping hardware kit included for child safety',
      'Finished with beautiful textured premium woodgrain laminate'
    ],
    care: 'Distribute storage weight evenly. Wipe door panels with a dry microfibre cloth. Periodically tighten hinge screws if needed.',
    assembly: true
  }
};

const runSeeder = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Clean Database
    console.log('Cleaning collections...');
    await Promise.all([
      Brand.deleteMany({}),
      Material.deleteMany({}),
      Color.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({})
    ]);
    console.log('Collections cleared.');

    // 2. Seed Brands
    console.log('Seeding Brands...');
    const brandDocs = [];
    for (const b of BRANDS) {
      const doc = await Brand.create({ name: b, slug: storageService.slugify(b), description: `${b} high-quality furniture brand` });
      brandDocs.push(doc);
    }

    // 3. Seed Materials
    console.log('Seeding Materials...');
    const matDocs = [];
    for (const m of MATERIALS) {
      const doc = await Material.create({ name: m, slug: storageService.slugify(m) });
      matDocs.push(doc);
    }

    // 4. Seed Colors
    console.log('Seeding Colors...');
    const colDocs = [];
    for (const c of COLORS) {
      const doc = await Color.create({ name: c.name, slug: storageService.slugify(c.name), hex: c.hex });
      colDocs.push(doc);
    }

    // 5. Seed Categories
    console.log('Seeding Categories...');
    const catDocs = {};
    for (const name of Object.keys(CATEGORY_COUNTS)) {
      const slug = storageService.slugify(name);
      const doc = await Category.create({
        name,
        slug,
        description: `Premium collection of ${name} furniture.`,
        image: `categories/${slug}-thumbnail.webp`
      });
      catDocs[name] = doc;
    }

    // 6. Seed Products (exactly 2,000 unique realistic products)
    console.log('Generating 2,000 unique products...');
    const nameSet = new Set();
    const skuSet = new Set();
    const allProducts = [];

    for (const [catName, count] of Object.entries(CATEGORY_COUNTS)) {
      console.log(`Generating ${count} products for Category: ${catName}...`);
      const catDoc = catDocs[catName];
      const catData = CATEGORIES_DATA[catName];

      for (let i = 0; i < count; i++) {
        // Randomly select relationship configurations
        const brandDoc = brandDocs[i % brandDocs.length];
        const matDoc = matDocs[i % matDocs.length];
        const colDoc = colDocs[i % colDocs.length];
        const subcat = catData.subcategories[i % catData.subcategories.length];

        // Generate unique name
        const adj = ADJECTIVES[i % ADJECTIVES.length];
        const design = DESIGN_NAMES[(i * 4) % DESIGN_NAMES.length];
        let productName = `${adj} ${design} ${matDoc.name} ${subcat}`;
        
        // Ensure name is globally unique
        if (nameSet.has(productName)) {
          productName = `${productName} - Model ${i + 1}`;
        }
        nameSet.add(productName);

        // Generate unique SKU
        const catCode = catName.substring(0, 2).toUpperCase();
        const matCode = matDoc.name.substring(0, 2).toUpperCase();
        const colCode = colDoc.name.substring(0, 2).toUpperCase();
        const numStr = String(i + 1).padStart(4, '0');
        let sku = `MHV-${catCode}-${matCode}-${colCode}-${numStr}`;
        
        if (skuSet.has(sku)) {
          sku = `${sku}-X${i}`;
        }
        skuSet.add(sku);

        // Pricing and discounts
        const basePrice = Math.floor(catData.minPrice + (Math.random() * (catData.maxPrice - catData.minPrice)));
        const discountRate = (i % 5 === 0) ? 0 : 0.1 + (Math.random() * 0.25); // 0% or 10-35% discount
        const discountPrice = discountRate > 0 ? Math.floor(basePrice * (1 - discountRate)) : basePrice;

        const stock = (i % 15 === 0) ? 0 : Math.floor(5 + Math.random() * 65);
        const rating = parseFloat((4.0 + Math.random() * 1.0).toFixed(1));
        const reviewCount = Math.floor(5 + Math.random() * 290);
        const weight = Math.floor(catData.minWeight + (Math.random() * (catData.maxWeight - catData.minWeight)));
        
        // File paths (keys) inside our uploads directory
        const slugifiedName = storageService.slugify(productName);
        const relativeDir = `products/${catDoc.slug}/${slugifiedName}`;

        const productPayload = {
          name: productName,
          sku: sku,
          brand: brandDoc._id,
          category: catDoc._id,
          subcategory: subcat,
          price: basePrice,
          discountPrice: discountPrice,
          stock: stock,
          material: matDoc._id,
          color: colDoc._id,
          dimensions: catData.dimTemplate(i),
          weight: weight,
          warranty: `${1 + (i % 3)} Year Warranty`,
          description: `The ${productName} is meticulously designed for modern homes. Combining high quality ${matDoc.name.toLowerCase()} with a sleek ${colDoc.name.toLowerCase()} finish, it offers outstanding comfort and visual style. Perfect for everyday family use, this ${subcat.toLowerCase()} adds premium utility and style to any indoor space.`,
          features: catData.features,
          careInstructions: catData.care,
          assemblyRequired: catData.assembly,
          availability: stock > 0 ? 'In Stock' : 'Out of Stock',
          rating: rating,
          reviewCount: reviewCount,
          thumbnail: `${relativeDir}/thumbnail.webp`,
          images: {
            front: `${relativeDir}/front.webp`,
            side: `${relativeDir}/side.webp`,
            back: `${relativeDir}/back.webp`,
            top: `${relativeDir}/top.webp`,
            lifestyle: `${relativeDir}/lifestyle.webp`,
            materialCloseUp: `${relativeDir}/material.webp`,
            dimensionImage: `${relativeDir}/dimension.webp`
          }
        };

        allProducts.push(productPayload);
      }
    }

    console.log('Saving products to database...');
    // Bulk insert for speed
    const insertedDocs = await Product.insertMany(allProducts);
    console.log(`Successfully seeded ${insertedDocs.length} products!`);
    
    // Summary checks
    console.log('Seeder run complete.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

runSeeder();
