import React from 'react';
import { FiDownload, FiFileText, FiPackage } from 'react-icons/fi';

const mockInvoices = [
  { id: 'INV-001', orderId: 'MHV123456', date: '20 July 2026', amount: '₹36,997', status: 'Paid' },
  { id: 'INV-002', orderId: 'MHV123457', date: '02 July 2026', amount: '₹28,499', status: 'Paid' },
  { id: 'INV-003', orderId: 'MHV123458', date: '04 July 2026', amount: '₹17,939', status: 'Pending' },
];

export default function InvoiceHistory() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">Invoice History</h1>
        <p className="text-xs text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">Download your order invoices</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-large shadow-premium overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Invoice ID</th>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {mockInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                  <FiFileText size={14} className="text-primary" /> {inv.id}
                </td>
                <td className="px-6 py-4 font-medium">{inv.orderId}</td>
                <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{inv.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                    <FiDownload size={12} /> Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
        <FiPackage size={12} /> Invoice generation powered by PDFKit — Future backend integration ready.
      </div>
    </div>
  );
}
