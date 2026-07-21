const Category = require('../../models/Category/Category.model');
const Brand = require('../../models/Brand/Brand.model');
const Material = require('../../models/Material/Material.model');
const Color = require('../../models/Color/Color.model');
const User = require('../../models/User/User.model');
const Order = require('../../models/Order/Order.model');

/**
 * Fetch all metadata options (categories, brands, materials, colors)
 */
const getMetadata = async (req, res) => {
  try {
    const [categories, brands, materials, colors] = await Promise.all([
      Category.find({}).sort({ name: 1 }),
      Brand.find({}).sort({ name: 1 }),
      Material.find({}).sort({ name: 1 }),
      Color.find({}).sort({ name: 1 })
    ]);

    res.status(200).json({
      categories,
      brands,
      materials,
      colors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fetch dashboard overview statistics (total users, orders, and sales)
 */
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, salesData] = await Promise.all([
      User.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalSales: { $sum: '$total' } } }
      ])
    ]);

    const totalSales = salesData[0] ? salesData[0].totalSales : 0;

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalSales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMetadata,
  getDashboardStats
};
