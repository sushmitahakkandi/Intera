import React from 'react';
import { FiSettings, FiLock, FiBell, FiGlobe, FiMoon, FiUser, FiSave } from 'react-icons/fi';

export default function ProfileSettings() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">Profile Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">Manage your account preferences</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Personal Info */}
        <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-5">
            <FiUser size={15} className="text-primary" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Full Name', 'Email Address', 'Phone Number', 'Date of Birth'].map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{field}</label>
                <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 focus:bg-white transition-all" placeholder={`Enter ${field.toLowerCase()}`} />
              </div>
            ))}
          </div>
          <button className="mt-5 flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-large hover:bg-primary-hover transition-all">
            <FiSave size={14} /> Save Changes
          </button>
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-5">
            <FiLock size={15} className="text-primary" /> Security
          </h3>
          <div className="flex flex-col gap-3">
            <button className="text-left text-sm font-semibold text-gray-700 border border-gray-100 rounded-large px-4 py-3 hover:border-primary hover:bg-primary-light transition-all">
              🔑 Change Password
            </button>
            <button className="text-left text-sm font-semibold text-gray-700 border border-gray-100 rounded-large px-4 py-3 hover:border-primary hover:bg-primary-light transition-all">
              📱 Two-Factor Authentication (2FA) — <span className="text-xs text-gray-400">Coming Soon</span>
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-5">
            <FiSettings size={15} className="text-primary" /> Preferences
          </h3>
          <div className="flex flex-col gap-4">
            {[
              { icon: FiBell, label: 'Email Notifications', desc: 'Receive order updates by email' },
              { icon: FiMoon, label: 'Dark Mode', desc: 'Toggle dark theme — Future feature' },
              { icon: FiGlobe, label: 'Language', desc: 'Select preferred language — Future feature' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Icon size={15} className="text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-gray-200 rounded-full cursor-pointer" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
