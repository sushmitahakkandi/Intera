const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'order_placed'
  },
  orderId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
