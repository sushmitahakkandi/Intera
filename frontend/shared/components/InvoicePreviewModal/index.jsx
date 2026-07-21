import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiPrinter } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fmt = (val) => {
  const n = Number(val);
  if (isNaN(n) || n === 0) return '0';
  return n.toLocaleString('en-IN');
};

const fmtCurrency = (val) => `₹${fmt(val)}`;

const statusStyle = {
  'Delivered':        { bg: '#d1fae5', color: '#065f46' },
  'Cancelled':        { bg: '#fee2e2', color: '#991b1b' },
  'Pending':          { bg: '#fef3c7', color: '#92400e' },
  'Shipped':          { bg: '#dbeafe', color: '#1e40af' },
  'Processing':       { bg: '#ede9fe', color: '#5b21b6' },
  'Out For Delivery': { bg: '#d1fae5', color: '#065f46' },
};

export default function InvoicePreviewModal({ order, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!order) return null;

  const orderId        = order.orderId        || 'N/A';
  const invoiceNumber  = order.invoiceNumber  || 'N/A';
  const date           = order.date           || new Date().toLocaleDateString('en-IN');
  const customerName   = order.customerName   || 'Customer';
  const email          = order.email          || '';
  const phone          = order.phone          || '';
  const status         = order.status         || 'Pending';
  const paymentStatus  = order.paymentStatus  || 'Pending';
  const paymentMethod  = order.paymentMethod  || 'COD';
  const addr           = order.shippingAddress || {};
  const items          = Array.isArray(order.items) ? order.items : [];
  const subtotal       = Number(order.subtotal)       || 0;
  const discount       = Number(order.discount)       || 0;
  const gst            = Number(order.gst)            || 0;
  const deliveryCharge = Number(order.deliveryCharge) || 0;
  const total          = Number(order.total)          || 0;

  const sStyle = statusStyle[status] || { bg: '#f3f4f6', color: '#374151' };
  const paid = paymentStatus.toLowerCase() === 'paid';

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(`${API_BASE}/api/orders/invoice/${orderId}`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-2xl z-10 bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Action bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Preview</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1a1a2e] text-white hover:bg-[#2a2a4e] transition-colors disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <FiDownload size={12} />
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Invoice body */}
          <div className="overflow-y-auto max-h-[80vh]">
            {/* Header */}
            <div className="bg-[#1a1a2e] px-8 py-6 flex justify-between items-start">
              <div>
                <p className="text-[#a0603a] font-black text-xl tracking-wide">MAHAVEER</p>
                <p className="text-[#6b7280] text-[10px] font-bold uppercase tracking-wider mt-0.5">Smart Furniture Hub</p>
                <p className="text-[#4b5563] text-[9px] mt-2 leading-relaxed">
                  Bangalore, Karnataka<br />
                  support@mahaveerfurniture.in
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#a0603a] text-2xl font-black">INVOICE</p>
                <p className="text-gray-400 text-[10px] font-mono mt-1">{invoiceNumber}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">Order: <span className="text-gray-300">#{orderId}</span></p>
                <p className="text-gray-500 text-[10px]">Date: <span className="text-gray-300">{date}</span></p>
              </div>
            </div>

            {/* Status pills */}
            <div className="flex gap-2 px-8 py-3 bg-[#111827] border-b border-gray-800">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase"
                style={{ background: sStyle.bg, color: sStyle.color }}
              >
                {status}
              </span>
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase"
                style={{ background: paid ? '#d1fae5' : '#fef3c7', color: paid ? '#065f46' : '#92400e' }}
              >
                {paymentStatus}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700">
                {paymentMethod}
              </span>
            </div>

            <div className="px-8 py-6 space-y-6">
              {/* Customer & Shipping */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[9px] font-black text-[#a0603a] uppercase tracking-wider mb-2">Billed To</p>
                  <p className="text-sm font-bold text-gray-800">{customerName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{email}</p>
                  <p className="text-xs text-gray-500">{phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[9px] font-black text-[#a0603a] uppercase tracking-wider mb-2">Shipping Address</p>
                  <p className="text-sm font-bold text-gray-800">{addr.name || customerName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{addr.street || '—'}</p>
                  <p className="text-xs text-gray-500">
                    {[addr.city, addr.state].filter(Boolean).join(', ')}
                    {addr.pincode ? ` - ${addr.pincode}` : ''}
                  </p>
                </div>
              </div>

              {/* Items table */}
              <div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#1a1a2e] text-white">
                      <th className="text-left px-3 py-2.5 rounded-tl-lg font-bold text-[10px] uppercase">Item</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[10px] uppercase">Qty</th>
                      <th className="text-right px-3 py-2.5 font-bold text-[10px] uppercase">Price</th>
                      <th className="text-right px-3 py-2.5 font-bold text-[10px] uppercase">Discount</th>
                      <th className="text-right px-3 py-2.5 rounded-tr-lg font-bold text-[10px] uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const ip = Number(item.price) || 0;
                      const id = Number(item.discount) || 0;
                      const iq = Number(item.qty) || 1;
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                          <td className="px-3 py-2.5 font-semibold text-gray-800 border-b border-gray-100">{item.name}</td>
                          <td className="px-3 py-2.5 text-center text-gray-600 border-b border-gray-100">{iq}</td>
                          <td className="px-3 py-2.5 text-right text-gray-600 border-b border-gray-100">{fmtCurrency(ip)}</td>
                          <td className="px-3 py-2.5 text-right border-b border-gray-100">
                            {id > 0 ? <span className="text-green-600 font-semibold">-{fmtCurrency(id)}</span> : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-gray-800 border-b border-gray-100">{fmtCurrency((ip - id) * iq)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-700">{fmtCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">Discount{order.coupon ? ` (${order.coupon})` : ''}</span>
                      <span className="font-semibold text-green-600">-{fmtCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-gray-700">{fmtCurrency(gst)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Delivery</span>
                    <span className="font-semibold text-gray-700">{deliveryCharge === 0 ? 'FREE' : fmtCurrency(deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#1a1a2e] rounded-xl px-4 py-3 mt-3">
                    <span className="text-sm font-black text-white">Grand Total</span>
                    <span className="text-base font-black text-[#a0603a]">{fmtCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="border-t border-gray-100 pt-4 text-center">
                <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                  This is a computer-generated invoice and does not require a signature.<br />
                  For returns &amp; queries: support@mahaveerfurniture.in | © {new Date().getFullYear()} Mahaveer Smart Furniture Hub
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
