const mongoose = require('mongoose');
const Coupon = require('../models/Coupon/Coupon.model');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';

const initialCoupons = [
  {
    code: 'SUMMER20',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 5000,
    expiryDate: new Date('2026-08-31'),
    status: 'Active',
    description: 'Get 20% off all purchases over ₹5,000 this summer.'
  },
  {
    code: 'FESTIVAL10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 2000,
    expiryDate: new Date('2026-09-15'),
    status: 'Active',
    description: 'Get 10% off purchases over ₹2,000 for the holiday season.'
  },
  {
    code: 'NEWUSER15',
    discountType: 'percentage',
    discountValue: 15,
    minPurchase: 1000,
    expiryDate: new Date('2026-07-31'),
    status: 'Inactive',
    description: 'Welcome discount: 15% off your first furniture purchase.'
  }
];

const seedCoupons = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Cleaning up existing coupons...');
    await Coupon.deleteMany({});

    console.log('Inserting default seed coupons...');
    await Coupon.insertMany(initialCoupons);
    console.log(`Successfully seeded ${initialCoupons.length} coupons!`);

    await mongoose.disconnect();
    console.log('Database disconnected.');
  } catch (error) {
    console.error('Seeding coupons failed:', error);
    process.exit(1);
  }
};

seedCoupons();
