const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    qty: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  coupon: {
    type: String,
    default: ''
  },
  gst: {
    type: Number,
    required: true,
    default: 0
  },
  deliveryCharge: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 
      'Out For Delivery', 'Delivered', 'Cancelled', 
      'Return Requested', 'Return Approved', 'Returned', 
      'Refund Processing', 'Refund Completed'
    ],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Refund Processing'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'COD'
  },
  transactionRef: {
    type: String,
    default: ''
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  courierPartner: {
    type: String,
    default: ''
  },
  estimatedDeliveryDate: {
    type: Date
  },
  courierContact: {
    type: String,
    default: ''
  },
  courierNotes: {
    type: String,
    default: ''
  },
  orderNotes: {
    type: String,
    default: ''
  },
  statusTimeline: [{
    status: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    adminName: { type: String, default: 'System' },
    remarks: { type: String, default: '' }
  }],
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  date: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for search performance
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ invoiceNumber: 1 });
OrderSchema.index({ email: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
