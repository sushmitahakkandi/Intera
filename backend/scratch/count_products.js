const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/mhv_furniture';

const countProducts = async () => {
  try {
    await mongoose.connect(mongoURI);
    
    // Minimal Product Schema
    const productSchema = new mongoose.Schema({
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    });
    const categorySchema = new mongoose.Schema({
      name: String
    });

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

    const products = await Product.find().populate('category').lean();
    console.log(`Total Products in DB: ${products.length}`);

    const counts = {};
    products.forEach(p => {
      const catName = p.category?.name || 'No Category';
      counts[catName] = (counts[catName] || 0) + 1;
    });

    console.log('Product counts by category:');
    console.log(JSON.stringify(counts, null, 2));

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

countProducts();
