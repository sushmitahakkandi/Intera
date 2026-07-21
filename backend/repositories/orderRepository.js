const Order = require('../models/Order/Order.model');

class OrderRepository {
  async findById(id) {
    return await Order.findById(id).populate('customer', 'name email');
  }

  async findByOrderId(orderId) {
    return await Order.findOne({ orderId }).populate('customer', 'name email');
  }

  async create(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  async update(orderId, updateData) {
    return await Order.findOneAndUpdate(
      { orderId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async updateByMongoId(id, updateData) {
    return await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async find(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20) {
    return await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name email');
  }

  async countDocuments(filter = {}) {
    return await Order.countDocuments(filter);
  }
}

module.exports = new OrderRepository();
