import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FiHome, FiBox, FiFolder, FiDollarSign, FiUsers, FiStar, FiPercent, FiTrendingUp, FiSliders, FiMenu, FiX, FiBell, FiChevronDown, FiUser, FiGrid, FiDatabase, FiPackage } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';
import { Loader, Avatar } from '../../../../shared/components/Common';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminLayout() {
  const { user, logout, adminSidebarCollapsed, setAdminSidebarCollapsed, loading, fetchOrders, isBackendOffline } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [prevNotificationsCount, setPrevNotificationsCount] = useState(0);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("AudioContext beep failed:", e);
    }
  };

  const loadNotifications = async (triggerBeep = false) => {
    try {
      const res = await axios.get(`${API_BASE}/api/notifications`);
      const data = res.data || [];
      setNotifications(data);
      
      const unreadCount = data.filter(n => !n.read).length;
      setPrevNotificationsCount(prev => {
        if (triggerBeep && unreadCount > prev) {
          playBeep();
          toast('New admin notification received!', { icon: '🔔' });
          if (typeof fetchOrders === 'function') {
            fetchOrders();
          }
        }
        return unreadCount;
      });
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_BASE}/api/notifications/mark-read`);
      loadNotifications(false);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications(false);
    
    const socket = io(API_BASE);
    socket.on('connect', () => {
      console.log('Socket.io: Connected to backend on admin-app layout');
    });

    socket.on('notification_received', () => {
      console.log('Socket.io: Notification received event on admin layout!');
      loadNotifications(true);
    });

    // Poll notifications every 10 seconds as fallback
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 10000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: FiHome },
    { label: 'Products', path: '/admin/products', icon: FiBox },
    { label: 'Inventory', path: '/admin/inventory', icon: FiPackage },
    { label: 'Categories', path: '/admin/categories', icon: FiFolder },
    { label: 'Bulk Operations', path: '/admin/bulk-operations', icon: FiDatabase },
    { label: 'Orders', path: '/admin/orders', icon: FiDollarSign },
    { label: 'Notifications', path: '/admin/notifications', icon: FiBell },
    { label: 'Customers', path: '/admin/customers', icon: FiUsers },
    { label: 'Reviews', path: '/admin/reviews', icon: FiStar },
    { label: 'Coupons', path: '/admin/coupons', icon: FiPercent },
    { label: 'Analytics', path: '/admin/analytics', icon: FiTrendingUp },
    { label: 'Settings', path: '/admin/settings', icon: FiSliders }
  ];

  const handleLogout = () => {
    logout();
    toast.success('Admin logged out');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-secondary text-gray-300">
      {/* Sidebar Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-800 justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-primary tracking-wider font-sans">
            M<span className="text-white text-sm font-bold ml-0.5">AHAVEER ADMIN</span>
          </span>
        </Link>
        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-large text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-premium'
                  : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {!adminSidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-large transition-colors"
        >
          <FiX size={18} />
          {!adminSidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Loader loading={loading} />

      {/* Connection warning banner */}
      {isBackendOffline && (
        <div className="bg-amber-600 text-white text-xs font-bold text-center py-2.5 px-4 shadow-md flex items-center justify-center gap-2 z-50 relative animate-pulse">
          <span>⚠️ Backend Server is offline. Please run <strong>npm run dev</strong> in the root folder to start all services (Backend + Database).</span>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar (Persistent) */}
        <aside
          className={`hidden md:block border-r border-gray-200 transition-all duration-300 flex-shrink-0 bg-secondary ${
            adminSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Drawer (Overlay) */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileDrawerOpen(false)}
            />
            {/* Drawer Body */}
            <div className="relative w-64 h-full z-10">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setMobileDrawerOpen(true);
                  } else {
                    setAdminSidebarCollapsed(!adminSidebarCollapsed);
                  }
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none"
              >
                <FiMenu size={20} />
              </button>
              <h2 className="text-base font-bold text-gray-800 hidden sm:block">Control Panel</h2>
            </div>

            <div className="flex items-center gap-5">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative"
                >
                  <FiBell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-large shadow-premium py-3 z-50">
                    <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">Notifications</span>
                      <button onClick={markAllRead} className="text-[10px] text-primary font-bold hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">No notifications</p>
                      ) : (
                        notifications.slice(0, 8).map(n => (
                          <div
                            key={n._id}
                            onClick={() => {
                              setNotificationsOpen(false);
                              if (n.orderId) {
                                navigate(`/admin/orders/${n.orderId}`);
                              } else {
                                navigate('/admin/notifications');
                              }
                            }}
                            className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-primary-light/30' : ''}`}
                          >
                            <p className="text-xs font-bold text-gray-700">{n.message}</p>
                            <p className="text-[9px] text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    {/* View All Footer */}
                    <div className="px-4 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/admin/notifications');
                        }}
                        className="w-full text-center text-[11px] text-primary font-bold hover:underline py-1"
                      >
                        View All Notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <Avatar name={user?.name || 'Admin'} size="sm" />
                  <span className="text-xs font-bold text-gray-700 capitalize hidden sm:inline-block">
                    {user?.name || 'Administrator'}
                  </span>
                  <FiChevronDown size={14} className="text-gray-400 hidden sm:inline" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-large shadow-premium py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                      <p className="text-xs font-bold text-gray-700 truncate">{user?.email}</p>
                    </div>
                    <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">My Profile</Link>
                    <Link to="/" className="block px-4 py-2 text-sm text-primary hover:bg-primary-light font-bold">Go to Customer Shop</Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-gray-50 font-bold"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className={`flex-1 p-6 md:p-8 overflow-y-auto w-full mx-auto ${location.pathname === '/admin/reviews' ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
            <Outlet />
          </main>

          {/* Admin Footer */}
          <footer className="py-4 px-8 border-t border-gray-200 text-center text-xs text-gray-400 bg-white">
            &copy; {new Date().getFullYear()} Mahaveer Smart Furniture Hub Admin Panel.
          </footer>
        </div>
      </div>
    </div>
  );
}
