import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FiHome, FiBox, FiFolder, FiDollarSign, FiUsers, FiStar, FiPercent, FiTrendingUp, FiSliders, FiMenu, FiX, FiBell, FiChevronDown, FiUser } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';
import { Loader, Avatar } from '../../../../shared/components/Common';

export default function AdminLayout() {
  const { user, logout, adminSidebarCollapsed, setAdminSidebarCollapsed, loading } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: FiHome },
    { label: 'Products', path: '/admin/products', icon: FiBox },
    { label: 'Categories', path: '/admin/categories', icon: FiFolder },
    { label: 'Orders', path: '/admin/orders', icon: FiDollarSign },
    { label: 'Customers', path: '/admin/customers', icon: FiUsers },
    { label: 'Reviews', path: '/admin/reviews', icon: FiStar },
    { label: 'Coupons', path: '/admin/coupons', icon: FiPercent },
    { label: 'Analytics', path: '/admin/analytics', icon: FiTrendingUp },
    { label: 'Seller Panel', path: '/admin/seller-panel', icon: FiSliders },
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
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Loader loading={loading} />

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
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-large shadow-premium py-3 z-50">
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">Notifications</span>
                    <button className="text-[10px] text-primary font-bold hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                      <p className="text-xs font-semibold text-gray-700">New Order Recieved</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Order #MHV123458 was placed</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                      <p className="text-xs font-semibold text-gray-700">Stock Warning</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">King Size Bed is running low (15 left)</p>
                    </div>
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
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Admin Footer */}
        <footer className="py-4 px-8 border-t border-gray-200 text-center text-xs text-gray-400 bg-white">
          &copy; {new Date().getFullYear()} Mahaveer Smart Furniture Hub Admin Panel.
        </footer>
      </div>
    </div>
  );
}
