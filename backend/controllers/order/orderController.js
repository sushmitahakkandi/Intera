const orderRepository = require('../../repositories/orderRepository');
const Product = require('../../models/Product/Product.model');
const orderValidator = require('../../validators/orderValidator');
const orderDto = require('../../dtos/orderDto');
const notificationService = require('../../services/notificationService');
const trackingService = require('../../services/trackingService');
const invoiceService = require('../../services/invoiceService');

/**
 * Helper to get current Indian date and time strings
 */
const getDateTime = () => {
  const dateObj = new Date();
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { dateStr, timeStr };
};

/**
 * 1. Place a new order (POST /orders)
 */
const createOrder = async (req, res) => {
  try {
    const data = req.body;
    
    // Validate order inputs
    const check = orderValidator.validateOrderPlacement(data);
    if (!check.isValid) {
      return res.status(400).json({ error: check.errors.join(', ') });
    }

    // Check inventory availability and calculate item charges
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of data.items) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return res.status(404).json({ error: `Product not found: ${item.name}` });
      }

      if (dbProduct.stock < item.qty) {
        return res.status(400).json({ error: `Insufficient stock for product: ${dbProduct.name}. Only ${dbProduct.stock} left.` });
      }

      const itemPrice = dbProduct.discountPrice > 0 ? dbProduct.discountPrice : dbProduct.price;
      const discount = dbProduct.discountPrice > 0 ? (dbProduct.price - dbProduct.discountPrice) : 0;
      
      validatedItems.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        image: dbProduct.images?.front || dbProduct.images?.thumbnail || '',
        qty: item.qty,
        price: itemPrice,
        discount: discount
      });

      calculatedSubtotal += itemPrice * item.qty;
    }

    // Deduct stock levels
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    // Calculations
    const gstRate = 0.18; // 18% GST
    const calculatedGst = Math.round(calculatedSubtotal * gstRate);
    
    // Free delivery for orders above Rs. 10,000, otherwise Rs. 500
    const deliveryCharge = calculatedSubtotal >= 10000 ? 0 : 500;
    
    // Calculate coupon discount
    let couponDiscount = 0;
    if (data.coupon) {
      // Mock coupon validation (20% off for SUMMER20, 10% for FESTIVAL10, 15% for NEWUSER15)
      const code = data.coupon.toUpperCase();
      if (code === 'SUMMER20') {
        couponDiscount = Math.round(calculatedSubtotal * 0.20);
      } else if (code === 'FESTIVAL10') {
        couponDiscount = Math.round(calculatedSubtotal * 0.10);
      } else if (code === 'NEWUSER15') {
        couponDiscount = Math.round(calculatedSubtotal * 0.15);
      }
    }

    const calculatedTotal = calculatedSubtotal - couponDiscount + calculatedGst + deliveryCharge;

    // Generate Order ID & Invoice Number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `MHV${randomSuffix}`;
    const invoiceNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${randomSuffix}`;

    const { dateStr, timeStr } = getDateTime();

    // Setup initial timeline event
    const statusTimeline = [{
      status: 'Pending',
      date: dateStr,
      time: timeStr,
      adminName: 'System',
      remarks: 'Order received and waiting for payment verification.'
    }];

    const orderPayload = {
      orderId,
      invoiceNumber,
      customer: req.user ? req.user.id : null,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discount: couponDiscount,
      coupon: data.coupon || '',
      gst: calculatedGst,
      deliveryCharge,
      total: calculatedTotal,
      status: 'Pending',
      paymentStatus: data.paymentMethod === 'COD' ? 'Pending' : 'Paid', // Mock online payment auto-pay
      paymentMethod: data.paymentMethod || 'COD',
      transactionRef: data.transactionRef || (data.paymentMethod === 'COD' ? '' : `TXN-${Date.now()}`),
      statusTimeline,
      shippingAddress: data.shippingAddress,
      date: dateStr
    };

    const newOrder = await orderRepository.create(orderPayload);

    // Dispatch Notifications & Broadcasts
    await notificationService.notify(req.app, {
      message: `New Order Placed: #${orderId} by ${data.customerName} (Total: Rs. ${calculatedTotal.toLocaleString()})`,
      type: 'order_placed',
      orderId
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: orderDto.toCustomer(newOrder)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2. Get list of orders with pagination, search and filters (GET /orders)
 */
const getOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = '', 
      paymentStatus = '', 
      sortBy = 'newest' 
    } = req.query;

    const filter = {};

    // Customer role restriction
    if (req.user && req.user.role !== 'admin') {
      filter.email = req.user.email;
    }

    // Applying status filter
    if (status) {
      filter.status = status;
    }

    // Applying payment status filter
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Text Search
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting parameters
    let sortObj = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sortBy === 'highest') {
      sortObj = { total: -1 };
    } else if (sortBy === 'lowest') {
      sortObj = { total: 1 };
    } else if (sortBy === 'deliveryDate') {
      sortObj = { estimatedDeliveryDate: 1 };
    }

    // If pagination is not requested (i.e. legacy or global context fetches), return a flat array
    if (!req.query.page) {
      const orders = await orderRepository.find(filter, sortObj, 0, 1000);
      const formatted = orders.map(ord => 
        req.user.role === 'admin' ? orderDto.toAdmin(ord) : orderDto.toCustomer(ord)
      );
      return res.status(200).json(formatted);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const orders = await orderRepository.find(filter, sortObj, skip, Number(limit));
    const totalCount = await orderRepository.countDocuments(filter);

    const formatted = orders.map(ord => 
      req.user.role === 'admin' ? orderDto.toAdmin(ord) : orderDto.toCustomer(ord)
    );

    res.status(200).json({
      orders: formatted,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3. Retrieve single order details (GET /orders/:id)
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order = await orderRepository.findByOrderId(id);
    if (!order) {
      order = await orderRepository.findById(id);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Security validation
    if (req.user.role !== 'admin' && order.email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied. You do not own this order record.' });
    }

    const formatted = req.user.role === 'admin' ? orderDto.toAdmin(order) : orderDto.toCustomer(order);
    res.status(200).json(formatted);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4. Transition Order Status (PATCH /orders/status)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, remarks = '', courierPartner, trackingNumber, estimatedDeliveryDate, courierContact, courierNotes, orderNotes } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ error: 'Missing Order ID or Target Status' });
    }

    const order = await orderRepository.findByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Enforce state transition rules
    if (!orderValidator.isValidTransition(order.status, status)) {
      return res.status(400).json({ error: `Invalid status transition from "${order.status}" to "${status}". Transitions must be sequential.` });
    }

    const updateFields = { status };
    const { dateStr, timeStr } = getDateTime();
    const adminName = req.user?.name || 'Admin';

    // Append to status timeline log
    const timelineEvent = {
      status,
      date: dateStr,
      time: timeStr,
      adminName,
      remarks: remarks || `Order advanced to ${status}.`
    };

    // If courier metadata provided, update them
    if (courierPartner) updateFields.courierPartner = courierPartner;
    if (trackingNumber) updateFields.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate) updateFields.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    if (courierContact) updateFields.courierContact = courierContact;
    if (courierNotes) updateFields.courierNotes = courierNotes;
    if (orderNotes !== undefined) updateFields.orderNotes = orderNotes;

    // Automatic payment transitions on Delivered
    if (status === 'Delivered') {
      updateFields.paymentStatus = 'Paid';
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { 
        $set: updateFields,
        $push: { statusTimeline: timelineEvent }
      },
      { new: true }
    );

    // Send notifications
    await notificationService.notify(req.app, {
      message: `Order #${orderId} status updated to: ${status}`,
      type: `order_${status.toLowerCase().replace(/ /g, '_')}`,
      orderId
    });

    res.status(200).json({
      message: 'Order status updated successfully',
      order: orderDto.toAdmin(updatedOrder)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5. Cancel Order (PATCH /orders/cancel)
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId, remarks = '' } = req.body;

    const order = await orderRepository.findByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Security validation
    if (req.user.role !== 'admin' && order.email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Cancellation eligibility check
    if (['Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ error: `Cannot cancel order at "${order.status}" stage.` });
    }

    const { dateStr, timeStr } = getDateTime();
    const adminName = req.user?.name || 'Customer';

    const timelineEvent = {
      status: 'Cancelled',
      date: dateStr,
      time: timeStr,
      adminName,
      remarks: remarks || 'Order cancelled by customer.'
    };

    // Restore Inventory stock levels
    for (const item of order.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty }
        });
      }
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { 
        $set: { status: 'Cancelled', paymentStatus: 'Refunded' },
        $push: { statusTimeline: timelineEvent }
      },
      { new: true }
    );

    await notificationService.notify(req.app, {
      message: `Order #${orderId} has been Cancelled`,
      type: 'order_cancelled',
      orderId
    });

    res.status(200).json({
      message: 'Order cancelled successfully',
      order: req.user.role === 'admin' ? orderDto.toAdmin(updatedOrder) : orderDto.toCustomer(updatedOrder)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 6. Return Process requests (PATCH /orders/return)
 */
const processOrderReturn = async (req, res) => {
  try {
    const { orderId, action, remarks = '' } = req.body; // action: 'request', 'approve', 'reject', 'complete'

    const order = await orderRepository.findByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { dateStr, timeStr } = getDateTime();
    const actorName = req.user?.name || 'System';
    let targetStatus = order.status;

    if (action === 'request') {
      // Customer requests return
      if (order.status !== 'Delivered') {
        return res.status(400).json({ error: 'Can only request returns on Delivered orders.' });
      }
      targetStatus = 'Return Requested';
    } else if (action === 'approve') {
      // Admin approves return
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
      if (order.status !== 'Return Requested') {
        return res.status(400).json({ error: 'Return request must be active.' });
      }
      targetStatus = 'Return Approved';
    } else if (action === 'reject') {
      // Admin rejects return
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
      if (order.status !== 'Return Requested') {
        return res.status(400).json({ error: 'Return request must be active.' });
      }
      targetStatus = 'Delivered'; // Reverts status to Delivered
    } else if (action === 'complete') {
      // Admin completes pickup & return
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
      if (order.status !== 'Return Approved') {
        return res.status(400).json({ error: 'Return must be approved first.' });
      }
      targetStatus = 'Returned';

      // Restore product stock levels on return approval & pickup completion
      for (const item of order.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.qty }
          });
        }
      }
    } else {
      return res.status(400).json({ error: 'Invalid return action parameter.' });
    }

    const timelineEvent = {
      status: targetStatus,
      date: dateStr,
      time: timeStr,
      adminName: actorName,
      remarks: remarks || `Return action details: ${action}`
    };

    const updated = await Order.findOneAndUpdate(
      { orderId },
      {
        $set: { status: targetStatus },
        $push: { statusTimeline: timelineEvent }
      },
      { new: true }
    );

    await notificationService.notify(req.app, {
      message: `Order #${orderId} return action: ${targetStatus}`,
      type: `order_return_${action}`,
      orderId
    });

    res.status(200).json({
      message: `Return process updated to: ${targetStatus}`,
      order: req.user.role === 'admin' ? orderDto.toAdmin(updated) : orderDto.toCustomer(updated)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 7. Refund triggering endpoint (PATCH /orders/refund)
 */
const processOrderRefund = async (req, res) => {
  try {
    const { orderId, action, remarks = '' } = req.body; // action: 'initiate', 'complete'

    const order = await orderRepository.findByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let targetStatus = order.status;
    let targetPaymentStatus = order.paymentStatus;
    const { dateStr, timeStr } = getDateTime();

    if (action === 'initiate') {
      targetStatus = 'Refund Processing';
      targetPaymentStatus = 'Refund Processing';
    } else if (action === 'complete') {
      targetStatus = 'Refund Completed';
      targetPaymentStatus = 'Refunded';
    } else {
      return res.status(400).json({ error: 'Invalid refund action.' });
    }

    const timelineEvent = {
      status: targetStatus,
      date: dateStr,
      time: timeStr,
      adminName: req.user.name,
      remarks: remarks || `Refund event action: ${action}`
    };

    const updated = await Order.findOneAndUpdate(
      { orderId },
      {
        $set: { status: targetStatus, paymentStatus: targetPaymentStatus },
        $push: { statusTimeline: timelineEvent }
      },
      { new: true }
    );

    await notificationService.notify(req.app, {
      message: `Order #${orderId} refund status: ${targetPaymentStatus}`,
      type: `order_refund_${action}`,
      orderId
    });

    res.status(200).json({
      message: `Refund status updated to: ${targetPaymentStatus}`,
      order: orderDto.toAdmin(updated)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 8. Order Tracking Detail (GET /orders/tracking/:id)
 */
const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    let order = await orderRepository.findByOrderId(id);
    if (!order) {
      order = await orderRepository.findById(id);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const details = trackingService.getTrackingDetails(order);
    res.status(200).json(details);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 9. Download PDF Invoice (GET /orders/invoice/:id)
 */
const downloadOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    let order = await orderRepository.findByOrderId(id);
    if (!order) {
      order = await orderRepository.findById(id);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Build a clean, null-safe object so invoiceService never crashes on undefined
    const orderData = {
      orderId:         order.orderId        || id,
      invoiceNumber:   order.invoiceNumber  || 'N/A',
      date:            order.date           || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')),
      customerName:    order.customerName   || 'Customer',
      email:           order.email         || '',
      phone:           order.phone         || '',
      status:          order.status         || 'Pending',
      paymentStatus:   order.paymentStatus  || 'Pending',
      paymentMethod:   order.paymentMethod  || 'COD',
      coupon:          order.coupon         || '',
      orderNotes:      order.orderNotes     || '',
      shippingAddress: order.shippingAddress || {},
      items:           (order.items || []).map(item => ({
        name:     item.name     || 'Product',
        qty:      Number(item.qty)      || 1,
        price:    Number(item.price)    || 0,
        discount: Number(item.discount) || 0,
      })),
      subtotal:        Number(order.subtotal)       || 0,
      discount:        Number(order.discount)       || 0,
      gst:             Number(order.gst)            || 0,
      deliveryCharge:  Number(order.deliveryCharge) || 0,
      total:           Number(order.total)          || 0,
    };

    const pdfBuffer = await invoiceService.generateInvoicePdf(orderData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${orderData.invoiceNumber}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error('[downloadOrderInvoice] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Make sure to define the local Order model instance for direct mongoose updates
const Order = require('../../models/Order/Order.model');

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  processOrderReturn,
  processOrderRefund,
  getOrderTracking,
  downloadOrderInvoice
};
