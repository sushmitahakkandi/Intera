import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../../../shared/components/Common';
import { FiCheck, FiTruck, FiArrowLeft, FiDownload, FiAlertTriangle, FiPhone, FiInfo, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { io } from 'socket.io-client';
import InvoicePreviewModal from '../../../../shared/components/InvoicePreviewModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function OrderTracking() {
  const { token, user } = useApp();
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || 'MHV123456';
  
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      // Fetch full order data if authenticated
      if (token) {
        try {
          const orderRes = await axios.get(`${API_BASE}/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOrder(orderRes.data);
        } catch (err) {
          console.warn("Failed to fetch full order details:", err);
        }
      }

      // Fetch tracking details (public endpoint)
      try {
        const trackRes = await axios.get(`${API_BASE}/api/orders/tracking/${orderId}`);
        setTracking(trackRes.data);
      } catch (err) {
        console.warn("Failed to fetch order tracking details:", err);
      }
    } catch (err) {
      console.error("Error in fetchOrderDetails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, token]);

  // Socket listener for instant updates
  useEffect(() => {
    const socket = io(API_BASE);
    socket.on('catalog_changed', () => {
      fetchOrderDetails();
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, token]);

  const handleCancelOrder = async () => {
    const confirm = window.confirm("Are you sure you want to cancel this order? This action cannot be undone.");
    if (!confirm) return;

    try {
      setActionLoading(true);
      await axios.patch(`${API_BASE}/api/orders/cancel`, {
        orderId,
        remarks: "Cancelled by customer via self-service tracker."
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Order cancelled successfully!");
      fetchOrderDetails();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    const reason = window.prompt("Please enter the reason for returning this item:");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Reason is required to request a return.");
      return;
    }

    try {
      setActionLoading(true);
      await axios.patch(`${API_BASE}/api/orders/return`, {
        orderId,
        action: 'request',
        remarks: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Return request submitted successfully. Waiting for admin approval.");
      fetchOrderDetails();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to submit return request.");
    } finally {
      setActionLoading(false);
    }
  };

  const downloadInvoice = () => {
    setShowInvoice(true);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  if (!order && !tracking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FiAlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">We couldn't find any tracking or order details for #{orderId}. Please check the order number or log in to your account.</p>
        <Link to="/shop">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const status = order ? order.status : (tracking ? tracking.status : 'Pending');
  const dateStr = order ? order.date : 'N/A';
  const totalAmount = order ? order.total : 0;

  // Render the linear flow steps
  const steps = [
    { label: 'Order Placed', code: 'Pending' },
    { label: 'Confirmed', code: 'Confirmed' },
    { label: 'Processing', code: 'Processing' },
    { label: 'Packed', code: 'Packed' },
    { label: 'Shipped', code: 'Shipped' },
    { label: 'Out for Delivery', code: 'Out For Delivery' },
    { label: 'Delivered', code: 'Delivered' }
  ];

  const stagesList = steps.map(s => s.code);
  const currentIdx = stagesList.indexOf(status);

  // If status is outside linear stages (e.g. Cancelled or Return)
  const isCancelled = status === 'Cancelled';
  const isReturnFlow = status.startsWith('Return') || status.startsWith('Refund') || status === 'Returned';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button and invoice link */}
      <div className="mb-6 flex justify-between items-center">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
          <FiArrowLeft size={16} /> Back to My Orders
        </Link>
        {order && (
          <Button size="sm" variant="outline" onClick={downloadInvoice} className="flex items-center gap-1.5 text-xs">
            <FiDownload size={13} /> Download Invoice PDF
          </Button>
        )}
      </div>

      {showInvoice && order && (
        <InvoicePreviewModal order={order} onClose={() => setShowInvoice(false)} />
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column: Timeline tracker */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <Card className="p-6">
            <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Order #{orderId}</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Placed on {dateStr}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-semibold">Total Paid</p>
                <p className="text-sm font-black text-primary mt-0.5">Rs. {totalAmount.toLocaleString()}</p>
              </div>
            </div>

            {isCancelled ? (
              <div className="p-4 bg-red-50 border border-red-150 rounded-large flex items-start gap-3 text-red-800 text-xs">
                <FiAlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold">Order Cancelled</p>
                  <p className="mt-1 font-medium text-red-700">This order has been cancelled and payments (if online) will be refunded to your original payment method.</p>
                </div>
              </div>
            ) : isReturnFlow ? (
              <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-large flex items-start gap-3 text-yellow-800 text-xs">
                <FiInfo size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-gray-800">Return Cycle Active</p>
                  <p className="mt-1 font-semibold text-gray-700">Current State: <span className="font-bold underline text-primary">{status}</span></p>
                  <p className="mt-0.5 font-medium text-gray-500">Wait for courier pickup scheduling. We will update you via SMS or in-app updates.</p>
                </div>
              </div>
            ) : (
              <div className="relative pl-8 ml-4 border-l-2 border-gray-100 flex flex-col gap-8">
                {steps.map((st, i) => {
                  const done = i <= currentIdx;
                  const current = i === currentIdx;

                  return (
                    <div key={st.code} className="relative">
                      <span className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                        done
                          ? 'bg-primary border-primary-light text-white shadow-sm'
                          : 'bg-white border-gray-100 text-gray-300'
                      } ${current ? 'ring-4 ring-primary/20' : ''}`}>
                        {done ? (
                          <FiCheck size={14} className="stroke-[3]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-200" />
                        )}
                      </span>
                      <div>
                        <h4 className={`text-sm font-bold ${
                          done || current ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                          {st.label}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block mt-1">
                          {current ? 'Active Stage' : done ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Self service actions for customer */}
            <div className="border-t border-gray-100 pt-5 mt-6 flex justify-end gap-3">
              {['Pending', 'Confirmed', 'Processing', 'Packed'].includes(status) && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleCancelOrder}
                  loading={actionLoading}
                  className="flex items-center gap-1.5"
                >
                  <FiTrash2 size={13} /> Cancel Reservation
                </Button>
              )}
              {status === 'Delivered' && (
                <Button
                  size="sm"
                  variant="warning"
                  onClick={handleRequestReturn}
                  loading={actionLoading}
                  className="flex items-center gap-1.5"
                >
                  <FiRefreshCw size={13} /> Request Item Return
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right column: Delivery map and courier details */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <Card className="p-6 flex flex-col justify-between bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Live Tracking Map</h3>
            
            <div className="flex-grow flex items-center justify-center relative my-6">
              <svg width="100%" height="240" viewBox="0 0 400 240" className="w-full h-full max-w-sm">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                <path
                  d="M 50,200 C 120,200 130,50 220,70 C 310,90 320,180 350,150"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                
                {currentIdx >= 4 && (
                  <path
                    d="M 50,200 C 120,200 130,50 220,70"
                    fill="none"
                    stroke="var(--color-primary, #6b4e3d)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="6,4"
                  />
                )}

                <circle cx="50" cy="200" r="8" fill="#10b981" />
                <text x="35" y="222" className="text-[10px] font-bold fill-gray-500">Warehouse</text>

                {currentIdx >= 4 && currentIdx < 6 && (
                  <g transform="translate(220, 70)">
                    <circle cx="0" cy="0" r="14" fill="var(--color-primary-light, #f5efe6)" className="animate-ping opacity-60" />
                    <circle cx="0" cy="0" r="10" fill="var(--color-primary, #6b4e3d)" />
                    <circle cx="0" cy="0" r="6" fill="#fff" />
                  </g>
                )}

                <circle cx="350" cy="150" r="8" fill="#3b82f6" />
                <text x="315" y="132" className="text-[10px] font-bold fill-gray-600">Home Address</text>
              </svg>
            </div>

            {/* Courier metrics */}
            <div className="border-t border-gray-150 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
              <div>
                <span className="text-gray-450 uppercase block text-[10px] font-bold">Courier details</span>
                <span className="text-gray-700 text-sm font-bold block mt-0.5">
                  {tracking && tracking.courierPartner !== 'N/A' ? `${tracking.courierPartner} (#${tracking.trackingNumber})` : 'Awaiting Dispatch'}
                </span>
                {tracking && tracking.courierContact !== 'N/A' && (
                  <span className="text-gray-400 font-bold block mt-1 flex items-center gap-1">
                    <FiPhone size={11} /> {tracking.courierContact}
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-450 uppercase block text-[10px] font-bold">Est. Delivery Date</span>
                <span className="text-primary text-sm font-bold block mt-0.5">
                  {tracking && tracking.estimatedDeliveryDate ? new Date(tracking.estimatedDeliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Pending Dispatch'}
                </span>
              </div>
            </div>

            {tracking && tracking.courierNotes !== 'N/A' && (
              <div className="mt-3 p-2.5 bg-white border rounded text-[10px] text-gray-500 font-medium">
                <span className="font-extrabold uppercase text-gray-700 block">Logistics Dispatch Remarks</span>
                {tracking.courierNotes}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}