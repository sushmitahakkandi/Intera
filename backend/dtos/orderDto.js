class OrderDto {
  toCustomer(order) {
    if (!order) return null;
    
    // Return order mapping excluding private internal notes
    return {
      id: order._id,
      orderId: order.orderId,
      invoiceNumber: order.invoiceNumber,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        qty: item.qty,
        price: item.price,
        discount: item.discount
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      coupon: order.coupon,
      gst: order.gst,
      deliveryCharge: order.deliveryCharge,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      courierPartner: order.courierPartner,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      courierContact: order.courierContact,
      courierNotes: order.courierNotes,
      statusTimeline: order.statusTimeline,
      shippingAddress: order.shippingAddress,
      date: order.date,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  toAdmin(order) {
    if (!order) return null;

    // Admins are allowed to see internal notes and transaction parameters
    return {
      id: order._id,
      orderId: order.orderId,
      invoiceNumber: order.invoiceNumber,
      customer: order.customer,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      coupon: order.coupon,
      gst: order.gst,
      deliveryCharge: order.deliveryCharge,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionRef: order.transactionRef,
      trackingNumber: order.trackingNumber,
      courierPartner: order.courierPartner,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      courierContact: order.courierContact,
      courierNotes: order.courierNotes,
      orderNotes: order.orderNotes,
      statusTimeline: order.statusTimeline,
      shippingAddress: order.shippingAddress,
      date: order.date,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }
}

module.exports = new OrderDto();
