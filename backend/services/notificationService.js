const Notification = require('../models/Notification/Notification.model');

class NotificationService {
  async notify(app, { message, type, orderId }) {
    try {
      const notification = new Notification({
        message,
        type,
        orderId,
        read: false
      });
      await notification.save();

      const io = app.get('io');
      if (io) {
        // Emit global updates
        io.emit('notification_received', {
          id: notification._id,
          message,
          type,
          orderId,
          createdAt: notification.createdAt
        });
        
        // Broadcast custom catalog and status changes
        io.emit('catalog_changed');
      }

      // Mock email notification to console/log
      console.log(`[Email Service Mock] Sent email to customer for order #${orderId} of type "${type}". Message: "${message}"`);
    } catch (err) {
      console.error('Failed to dispatch notification:', err);
    }
  }
}

module.exports = new NotificationService();
