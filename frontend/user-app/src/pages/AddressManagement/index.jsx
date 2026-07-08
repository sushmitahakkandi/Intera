import React, { useState } from 'react';
import { FiPlus, FiMapPin, FiEdit2, FiTrash2, FiHome, FiBriefcase } from 'react-icons/fi';

const mockAddresses = [
  { id: 1, type: 'Home', name: 'Basavaraj H G', line1: '123, MG Road', line2: 'Davangere, Karnataka', pin: '577004', phone: '+91 9741212888', isDefault: true },
  { id: 2, type: 'Office', name: 'Basavaraj H G', line1: '456, Brigade Road', line2: 'Bengaluru, Karnataka', pin: '560001', phone: '+91 9741212888', isDefault: false },
];

export default function AddressManagement() {
  const [addresses] = useState(mockAddresses);
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Manage Addresses</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">Saved delivery locations</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-large hover:bg-primary-hover transition-all">
          <FiPlus size={16} /> Add New Address
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {addresses.map((addr) => (
          <div key={addr.id} className={`bg-white border ${addr.isDefault ? 'border-primary' : 'border-gray-100'} rounded-large shadow-premium p-5`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 mb-2">
                {addr.type === 'Home' ? <FiHome size={16} className="text-primary" /> : <FiBriefcase size={16} className="text-primary" />}
                <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary-light px-2 py-0.5 rounded-full">{addr.type}</span>
                {addr.isDefault && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Default</span>}
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><FiEdit2 size={14} /></button>
                <button className="p-1.5 hover:bg-red-50 rounded-full text-red-400 transition-colors"><FiTrash2 size={14} /></button>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FiMapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-800">{addr.name}</p>
                <p className="text-sm text-gray-500">{addr.line1}</p>
                <p className="text-sm text-gray-500">{addr.line2} – {addr.pin}</p>
                <p className="text-sm text-gray-500 mt-0.5">📞 {addr.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
