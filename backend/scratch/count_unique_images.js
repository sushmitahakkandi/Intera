const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/mhv_furniture';

const countUniqueImages = async () => {
  try {
    await mongoose.connect(mongoURI);
    
    // Minimal Product Schema
    const productSchema = new mongoose.Schema({
      thumbnail: String,
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    });
    const categorySchema = new mongoose.Schema({
      name: String
    });

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

    const products = await Product.find().populate('category').lean();
    console.log(`Total Products: ${products.length}`);

    const uniqueImagesByCategory = {};
    products.forEach(p => {
      const catName = p.category?.name || 'No Category';
      if (!uniqueImagesByCategory[catName]) {
        uniqueImagesByCategory[catName] = new Set();
      }
      if (p.thumbnail) {
        const base = p.thumbnail.split('?')[0];
        uniqueImagesByCategory[catName].add(base);
      }
    });

    console.log('Unique image counts by category:');
    for (const [catName, set] of Object.entries(uniqueImagesByCategory)) {
      console.log(`- ${catName}: ${set.size} unique image URLs`);
    }

    const chairs = products.filter(p => p.category?.name === 'Chair');
    console.log('\nSample Chair image URLs:');
    chairs.slice(0, 5).forEach((p, i) => {
      console.log(`${i + 1}. Name: "${p.name}", URL: "${p.thumbnail}"`);
    });

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

countUniqueImages();
