class TrackingService {
  getTrackingDetails(order) {
    if (!order) return null;

    const baseDetails = {
      orderId: order.orderId,
      status: order.status,
      trackingNumber: order.trackingNumber || 'N/A',
      courierPartner: order.courierPartner || 'N/A',
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      courierContact: order.courierContact || 'N/A',
      courierNotes: order.courierNotes || 'N/A'
    };

    // Calculate progression percentage and step status logs
    const stages = [
      'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 
      'Out For Delivery', 'Delivered'
    ];
    const currentIndex = stages.indexOf(order.status);

    let progressPercent = 0;
    if (currentIndex >= 0) {
      progressPercent = Math.round((currentIndex / (stages.length - 1)) * 100);
    } else if (order.status === 'Cancelled') {
      progressPercent = 0;
    } else if (order.status.startsWith('Return') || order.status.startsWith('Refund')) {
      progressPercent = 100; // Complete cycle prior to return
    }

    return {
      ...baseDetails,
      progressPercent,
      currentStep: currentIndex >= 0 ? currentIndex + 1 : 0,
      totalSteps: stages.length,
      nextStep: currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : 'Completed'
    };
  }
}

module.exports = new TrackingService();
