import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiEdit2, FiShoppingBag, FiMapPin, FiCreditCard, FiFileText, FiBell, FiSettings } from 'react-icons/fi';

const dashboardCards = [
  { icon: FiShoppingBag, label: 'My Orders', value: '3', sub: 'Total placed', link: '/orders', color: 'bg-blue-50 text-blue-600' },
  { icon: FiMapPin, label: 'Addresses', value: '2', sub: 'Saved addresses', link: '/address', color: 'bg-green-50 text-green-600' },
  { icon: FiCreditCard, label: 'Payment Methods', value: '1', sub: 'Saved cards', link: '/payment-methods', color: 'bg-purple-50 text-purple-600' },
  { icon: FiFileText, label: 'Invoices', value: '3', sub: 'Download history', link: '/invoices', color: 'bg-yellow-50 text-yellow-600' },
];

export default function CustomerDashboard() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">My Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">Welcome back, Basavaraj!</p>
        </div>
        <Link to="/profile-settings" className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <FiEdit2 size={14} /> Edit Profile
        </Link>
      </div>

      {/* Profile summary */}
      <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6 flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
          <FiUser size={28} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Basavaraj H G</h2>
          <p className="text-sm text-gray-500">basavaraj@gmail.com</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Verified Customer</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.link} className="bg-white border border-gray-100 rounded-large shadow-premium p-5 hover:shadow-premium-hover transition-all duration-200 group">
              <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center mb-3`}>
                <Icon size={18} />
              </div>
              <div className="text-2xl font-extrabold text-gray-800">{card.value}</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">{card.label}</div>
              <div className="text-xs text-gray-400">{card.sub}</div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: FiBell, label: 'Notifications', link: '/notifications' },
            { icon: FiSettings, label: 'Profile Settings', link: '/profile-settings' },
            { icon: FiFileText, label: 'Support Tickets', link: '/support' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.link} className="flex items-center gap-3 p-3 border border-gray-100 rounded-large hover:border-primary hover:bg-primary-light transition-all duration-200">
                <Icon size={16} className="text-primary" />
                <span className="text-sm font-semibold text-gray-700">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
