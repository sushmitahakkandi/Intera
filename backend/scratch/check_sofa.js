const mongoose = require('mongoose');
const path = require('path');

const mongoURI = 'mongodb://127.0.0.1:27017/mhv_furniture';

const checkSofa = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    // Define minimal Product Schema to fetch data
    const productSchema = new mongoose.Schema({
      name: String,
      sku: String,
      thumbnail: String,
      material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    });

    const materialSchema = new mongoose.Schema({
      name: String,
      slug: String
    });

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);

    const prod = await Product.findOne({ sku: 'MHV-SOFA-ME-DA-0346' })
      .populate('material')
      .lean();

    console.log('Database Product Record:', JSON.stringify(prod, null, 2));

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkSofa();
