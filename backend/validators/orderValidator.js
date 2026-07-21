const validTransitions = {
  'Pending': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Processing', 'Cancelled'],
  'Processing': ['Packed', 'Cancelled'],
  'Packed': ['Shipped', 'Cancelled'],
  'Shipped': ['Out For Delivery'],
  'Out For Delivery': ['Delivered'],
  'Delivered': ['Return Requested'],
  'Return Requested': ['Return Approved', 'Delivered'], // Can reject back to Delivered or reject state
  'Return Approved': ['Returned'],
  'Returned': ['Refund Processing'],
  'Refund Processing': ['Refund Completed'],
  'Cancelled': [],
  'Refund Completed': []
};

class OrderValidator {
  isValidTransition(currentStatus, nextStatus) {
    if (!currentStatus) return true; // Initial status is always allowed
    if (currentStatus === nextStatus) return true; // No status change is allowed

    const allowed = validTransitions[currentStatus] || [];
    return allowed.includes(nextStatus);
  }

  validateOrderPlacement(data) {
    const errors = [];
    if (!data.customerName) errors.push('Customer name is required');
    if (!data.email) errors.push('Email is required');
    if (!data.phone) errors.push('Phone number is required');
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('Order must contain at least one item');
    } else {
      data.items.forEach((item, index) => {
        if (!item.name) errors.push(`Item at index ${index} must have a name`);
        if (!item.qty || item.qty <= 0) errors.push(`Item at index ${index} must have a valid quantity`);
        if (item.price === undefined || item.price < 0) errors.push(`Item at index ${index} must have a valid price`);
      });
    }
    if (!data.shippingAddress) {
      errors.push('Shipping address is required');
    } else {
      const sa = data.shippingAddress;
      if (!sa.street) errors.push('Shipping street is required');
      if (!sa.city) errors.push('Shipping city is required');
      if (!sa.state) errors.push('Shipping state is required');
      if (!sa.pincode) errors.push('Shipping pincode is required');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new OrderValidator();
exportObject = { validTransitions }; // Expose configuration mapping for frontend reuse if desired
