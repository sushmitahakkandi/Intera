const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/mhv_furniture';

const checkSofaImages = async () => {
  try {
    await mongoose.connect(mongoURI);
    
    // Minimal Product Schema
    const productSchema = new mongoose.Schema({
      name: String,
      thumbnail: String,
      material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    });
    const materialSchema = new mongoose.Schema({
      name: String
    });
    const categorySchema = new mongoose.Schema({
      name: String
    });

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);
    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

    const targetUrl = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/mahaveer-stockholm-metal-loveseat/thumbnail.webp';
    const products = await Product.find({ thumbnail: targetUrl })
      .populate('category')
      .populate('material')
      .lean();

    console.log(`Found ${products.length} products with solid wood L-shape image.`);
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. Name: "${p.name}", Category: "${p.category?.name}", Material: "${p.material?.name}"`);
    });

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkSofaImages();
