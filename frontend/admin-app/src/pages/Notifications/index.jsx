import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../../../shared/components/Common';
import { FiBell, FiCheckCircle, FiPackage, FiClock, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/notifications`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await axios.put(`${API_BASE}/api/notifications/mark-read`);
      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications');
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.orderId) {
      navigate(`/admin/orders/${notification.orderId}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order_placed': return <FiPackage size={20} />;
      case 'stock_warning': return <FiClock size={20} />;
      default: return <FiBell size={20} />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'order_placed': return 'bg-blue-100 text-blue-600';
      case 'stock_warning': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTimeDifference = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <span className="p-2.5 bg-primary/10 rounded-full">
              <FiBell className="text-primary" size={22} />
            </span>
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs font-extrabold px-2.5 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-400 font-semibold uppercase mt-1">
            All admin alerts and order notifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="flex items-center gap-1.5">
              <FiCheckCircle size={14} />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
        {[
          { key: 'all', label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read', label: `Read (${notifications.length - unreadCount})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all duration-200 border-b-2 ${
              filter === tab.key
                ? 'text-primary border-primary bg-primary/5'
                : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiBell className="text-gray-300" size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-600 mb-1">No notifications</h3>
          <p className="text-sm text-gray-400 max-w-sm">
            {filter === 'unread'
              ? "You're all caught up! No unread notifications."
              : "No notifications to display yet. They'll appear here when customers place orders."
            }
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {filtered.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hoverEffect
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-4 p-5 transition-all duration-200 group ${
                    !notification.read
                      ? 'border-l-4 border-l-primary bg-primary/[0.02]'
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${getIconBg(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${!notification.read ? 'font-bold text-gray-800' : 'font-semibold text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                            <FiClock size={11} />
                            {getTimeDifference(notification.createdAt)}
                          </span>
                          <span className="text-[11px] text-gray-300">•</span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {new Date(notification.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                            {' · '}
                            {new Date(notification.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          {!notification.read && (
                            <Badge status="info">Unread</Badge>
                          )}
                        </div>
                      </div>

                      {/* Action indicator */}
                      {notification.orderId && (
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                            View Order
                          </span>
                          <FiExternalLink size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                      )}
                    </div>

                    {/* Order Quick Info */}
                    {notification.orderId && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                        <FiPackage size={12} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-500">
                          Order #{notification.orderId}
                        </span>
                        <span className="text-[10px] text-primary font-bold cursor-pointer hover:underline">
                          → Process Order
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
