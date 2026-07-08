import React from 'react';
import { FiCreditCard, FiPlus, FiTrash2, FiShield, FiCheckCircle } from 'react-icons/fi';

const mockCards = [
  { id: 1, type: 'Visa', last4: '4242', expiry: '08/28', holder: 'Basavaraj H G', isDefault: true },
  { id: 2, type: 'Mastercard', last4: '5678', expiry: '12/26', holder: 'Basavaraj H G', isDefault: false },
];

export default function PaymentMethods() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Payment Methods</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">Manage saved cards & wallets</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-large hover:bg-primary-hover transition-all">
          <FiPlus size={16} /> Add New Card
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {mockCards.map((card) => (
          <div key={card.id} className={`bg-white border ${card.isDefault ? 'border-primary' : 'border-gray-100'} rounded-large shadow-premium p-5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-md flex items-center justify-center">
                  <FiCreditCard size={16} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{card.type} •••• {card.last4}</span>
                    {card.isDefault && (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <FiCheckCircle size={10} /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Expires {card.expiry} · {card.holder}</p>
                </div>
              </div>
              <button className="p-1.5 hover:bg-red-50 rounded-full text-red-400 transition-colors"><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary-light border border-primary/20 rounded-large p-4 flex items-center gap-3">
        <FiShield size={18} className="text-primary flex-shrink-0" />
        <p className="text-xs text-gray-600 font-medium">Your payment information is encrypted and secured. We never store your full card details. <span className="text-primary font-bold">Future: Razorpay / Stripe integration</span></p>
      </div>
    </div>
  );
}
