import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Input } from '../../../../shared/components/Common';
import { 
  FiArrowLeft, FiPackage, FiUser, FiMapPin, FiDollarSign, 
  FiTruck, FiCheckCircle, FiClock, FiPhone, FiMail, 
  FiPrinter, FiAlertCircle, FiClipboard, FiSave, FiList
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import InvoicePreviewModal from '../../../../shared/components/InvoicePreviewModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const S3_BASE = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com';

const getDeterministicIndex = (str, range = 50) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % range;
};

const resolveImageSource = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  let cleanedKey = path.replace(/^\//, '');

  const segments = cleanedKey.split('/');
  if (segments[0] === 'products' && segments.length === 4) {
    const category = segments[1];
    const productSlug = segments[2];
    const index = getDeterministicIndex(productSlug, 50);
    cleanedKey = `cache/${category}/img-${index}.webp`;
  }
  
  return `${S3_BASE}/${cleanedKey}`;
};

const guessFallbackImage = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('sofa') || lower.includes('loveseat') || lower.includes('couch')) {
    return 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp';
  }
  if (lower.includes('chair') || lower.includes('stool') || lower.includes('recliner')) {
    return 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/chair/img-0.webp';
  }
  if (lower.includes('bed') || lower.includes('mattress')) {
    return 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/bed/img-0.webp';
  }
  if (lower.includes('dining')) {
    return 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/dining/img-0.webp';
  }
  if (lower.includes('table') || lower.includes('desk')) {
    return 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/tables/img-0.webp';
  }
  if (lower.includes('storage') || lower.includes('wardrobe') || lower.includes('cabinet') || lower.includes('shelf')) {
    return 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/storage/img-0.webp';
  }
  return null;
};


export default function OrderDetail() {
  const { orderId } = useParams();
  const { token } = useApp();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Form states for Courier details
  const [courierPartner, setCourierPartner] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [courierContact, setCourierContact] = useState('');
  const [courierNotes, setCourierNotes] = useState('');

  // Internal Notes state
  const [orderNotes, setOrderNotes] = useState('');
  const [remarks, setRemarks] = useState('');

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setOrder(data);
      
      // Populate form states
      setCourierPartner(data.courierPartner || '');
      setTrackingNumber(data.trackingNumber || '');
      setEstimatedDeliveryDate(data.estimatedDeliveryDate ? new Date(data.estimatedDeliveryDate).toISOString().split('T')[0] : '');
      setCourierContact(data.courierContact || '');
      setCourierNotes(data.courierNotes || '');
      setOrderNotes(data.orderNotes || '');
    } catch (err) {
      console.error('Error loading order details:', err);
      toast.error('Failed to load order detail records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && orderId) {
      loadOrder();
    }
  }, [orderId, token]);

  // Real-time synchronization
  useEffect(() => {
    const socket = io(API_BASE);
    socket.on('catalog_changed', () => {
      loadOrder();
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  const handleUpdateStatus = async (newStatus) => {
    const confirm = window.confirm(`Are you sure you want to transition this order status to "${newStatus}"?`);
    if (!confirm) return;

    try {
      setUpdating(true);
      await axios.patch(`${API_BASE}/api/orders/status`, {
        orderId: order.orderId,
        status: newStatus,
        remarks: remarks || `Order advanced to ${newStatus}.`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRemarks('');
      await loadOrder();
      toast.success(`Order status updated to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCourierDetails = async () => {
    try {
      setUpdating(true);
      await axios.patch(`${API_BASE}/api/orders/status`, {
        orderId: order.orderId,
        status: order.status,
        courierPartner,
        trackingNumber,
        estimatedDeliveryDate,
        courierContact,
        courierNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Courier parameters saved successfully!');
      await loadOrder();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save courier info.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setUpdating(true);
      await axios.patch(`${API_BASE}/api/orders/status`, {
        orderId: order.orderId,
        status: order.status,
        orderNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Internal notes saved.');
      await loadOrder();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save note.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = window.prompt('Please enter cancellation reason:');
    if (reason === null) return;

    try {
      setUpdating(true);
      await axios.patch(`${API_BASE}/api/orders/cancel`, {
        orderId: order.orderId,
        remarks: reason || 'Cancelled by Admin.'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order cancelled and stock levels restored.');
      await loadOrder();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Cancellation failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleReturnAction = async (action) => {
    const confirm = window.confirm(`Are you sure you want to perform return action: "${action}"?`);
    if (!confirm) return;

    try {
      setUpdating(true);
      await axios.patch(`${API_BASE}/api/orders/return`, {
        orderId: order.orderId,
        action,
        remarks: `Return action "${action}" completed.`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Return status updated: ${action}`);
      await loadOrder();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Return update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefundAction = async (action) => {
    const confirm = window.confirm(`Are you sure you want to perform refund action: "${action}"?`);
    if (!confirm) return;

    try {
      setUpdating(true);
      await axios.patch(`${API_BASE}/api/orders/refund`, {
        orderId: order.orderId,
        action,
        remarks: `Refund action "${action}" processed.`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Refund status updated: ${action}`);
      await loadOrder();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Refund process failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = () => {
    setShowInvoice(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FiPackage className="text-gray-300 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-600 mb-2">Order Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">The order #{orderId} could not be found.</p>
        <Button onClick={() => navigate('/admin/orders')}>
          <FiArrowLeft size={16} className="mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  const displayId = order.orderId || order._id;
  const customerName = order.customerName || 'Customer';
  const orderDate = order.date || 'N/A';

  // Standard linear steps
  const linearSteps = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];
  const isLinear = linearSteps.includes(order.status);
  const currentStepIndex = isLinear ? linearSteps.indexOf(order.status) : -1;

  // Retrieve valid next transition options
  const getNextStatuses = (current) => {
    const transitions = {
      'Pending': ['Confirmed', 'Cancelled'],
      'Confirmed': ['Processing', 'Cancelled'],
      'Processing': ['Packed', 'Cancelled'],
      'Packed': ['Shipped', 'Cancelled'],
      'Shipped': ['Out For Delivery'],
      'Out For Delivery': ['Delivered'],
      'Delivered': ['Return Requested'],
      'Return Requested': ['Return Approved', 'Delivered'],
      'Return Approved': ['Returned'],
      'Returned': ['Refund Processing'],
      'Refund Processing': ['Refund Completed'],
      'Cancelled': [],
      'Refund Completed': []
    };
    return transitions[current] || [];
  };

  const nextOptions = getNextStatuses(order.status);

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-5xl mx-auto">
      {showInvoice && order && (
        <InvoicePreviewModal order={order} onClose={() => setShowInvoice(false)} />
      )}
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
              Order #{displayId}
              <Badge status={
                order.status === 'Delivered' || order.status === 'Refund Completed' ? 'success' :
                ['Shipped', 'Out For Delivery', 'Return Approved'].includes(order.status) ? 'info' :
                order.status === 'Cancelled' ? 'danger' :
                'warning'
              }>{order.status}</Badge>
            </h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              Placed on {orderDate} • Invoice: {order.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleDownloadInvoice} className="flex items-center gap-1.5 text-gray-600">
            <FiPrinter size={14} /> Download PDF Invoice
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')} className="flex items-center gap-1.5">
            <FiPackage size={14} /> All Orders
          </Button>
        </div>
      </div>

      {/* Progress timeline */}
      {isLinear ? (
        <Card className="p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiTruck size={16} className="text-primary" />
            Fulfillment Progress
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-between relative mb-8 gap-4 md:gap-0">
            <div className="absolute top-5 left-[8%] right-[8%] h-1 bg-gray-100 rounded-full hidden md:block" />
            
            {linearSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step} className="flex flex-col items-center relative z-10 w-full md:w-auto" style={{ flex: 1 }}>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2 ${
                      isCompleted
                        ? 'bg-primary border-primary text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                  >
                    {isCompleted ? <FiCheckCircle size={15} /> : index + 1}
                  </div>
                  <span className={`text-[10px] font-extrabold mt-2 ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="p-4 border-red-150 bg-red-50/50 flex items-start gap-2.5 text-xs text-red-800">
          <FiAlertCircle className="mt-0.5 text-red-600 flex-shrink-0" size={16} />
          <div>
            <p className="font-extrabold">Alternative Process Cycle Active</p>
            <p className="font-medium text-red-700/90 mt-0.5">This order is currently flagged as: <span className="font-bold uppercase underline">{order.status}</span>. Standard linear fulfillment flows are bypassed.</p>
          </div>
        </Card>
      )}

      {/* Action center */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
          <FiClipboard size={16} className="text-primary" />
          Fulfillment Actions Control Center
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Status Transitions */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Advance Fulfillment state</span>
            <div className="flex flex-col gap-3">
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional transition remarks (visible on timeline)..."
                className="w-full p-2.5 border rounded-large text-xs focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
              />
              
              <div className="flex flex-wrap gap-2">
                {nextOptions.length === 0 ? (
                  <span className="text-xs text-gray-400 font-bold">Fulfillment cycle is completed or cancelled.</span>
                ) : (
                  nextOptions.map(next => {
                    const isCancel = next === 'Cancelled';
                    return (
                      <Button
                        key={next}
                        size="sm"
                        variant={isCancel ? 'danger' : 'primary'}
                        onClick={() => handleUpdateStatus(next)}
                        loading={updating}
                      >
                        Advance to {next}
                      </Button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Alternative state handlers */}
            <div className="mt-6 border-t pt-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Exceptions and Return approvals</span>
              <div className="flex flex-wrap gap-2">
                {order.status === 'Return Requested' && (
                  <>
                    <Button size="sm" variant="success" onClick={() => handleReturnAction('approve')}>Approve Return</Button>
                    <Button size="sm" variant="danger" onClick={() => handleReturnAction('reject')}>Reject Return</Button>
                  </>
                )}
                {order.status === 'Return Approved' && (
                  <Button size="sm" variant="primary" onClick={() => handleReturnAction('complete')}>Complete Return (Receive Stock)</Button>
                )}
                {order.status === 'Returned' && (
                  <Button size="sm" variant="warning" onClick={() => handleRefundAction('initiate')}>Initiate Refund</Button>
                )}
                {order.status === 'Refund Processing' && (
                  <Button size="sm" variant="success" onClick={() => handleRefundAction('complete')}>Finalize Refund</Button>
                )}
                {!['Cancelled', 'Refund Completed', 'Delivered'].includes(order.status) && (
                  <Button size="sm" variant="danger" onClick={handleCancelOrder}>Mass Cancel Order</Button>
                )}
              </div>
            </div>
          </div>

          {/* Courier assignments */}
          <div className="bg-gray-50 border p-4 rounded-large flex flex-col gap-3">
            <span className="text-[10px] font-bold text-gray-650 uppercase tracking-wider block mb-1">Courier Logistics Details</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Courier Partner</label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart"
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-large text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. BD98711"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-large text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Est. Delivery Date</label>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-large text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Courier Contact</label>
                <input
                  type="text"
                  placeholder="e.g. +91 99999 88888"
                  value={courierContact}
                  onChange={(e) => setCourierContact(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-large text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Courier notes / dispatch notes</label>
              <input
                type="text"
                placeholder="Fragile items, deliver to 3rd floor..."
                value={courierNotes}
                onChange={(e) => setCourierNotes(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 border rounded-large text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
              />
            </div>

            <Button onClick={handleSaveCourierDetails} size="sm" className="mt-2 w-full flex items-center justify-center gap-1.5">
              <FiSave size={13} /> Save Courier Parameters
            </Button>
          </div>
        </div>
      </Card>

      {/* Main breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Order items and timeline */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Items card */}
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FiPackage size={16} className="text-primary" />
                Items list ({order.items?.length || 0})
              </h3>
            </div>

            <div className="divide-y divide-gray-50">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded-large flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                    {item.image && !item.image.includes('products/general/thumbnail.webp') ? (
                      <img src={resolveImageSource(item.image)} alt={item.name} className="w-full h-full object-cover" />
                    ) : guessFallbackImage(item.name) ? (
                      <img src={guessFallbackImage(item.name)} alt={item.name} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <FiPackage className="text-gray-300" size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      Qty: {item.qty} × Rs. {item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-extrabold text-gray-800">
                      Rs. {((item.price - (item.discount || 0)) * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-1.5 text-xs font-semibold text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-850">Rs. {order.subtotal?.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon discount ({order.coupon || 'applied'})</span>
                  <span>-Rs. {order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="text-gray-850">Rs. {order.gst?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-gray-850">{order.deliveryCharge === 0 ? 'FREE' : `Rs. ${order.deliveryCharge?.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-800 mt-2 pt-2 border-t">
                <span>Total Amount paid</span>
                <span className="text-primary text-base font-black">Rs. {order.total?.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Audit trail / timeline */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
              <FiList size={16} className="text-primary" />
              Detailed Fulfillment Audit Log Timeline
            </h3>

            <div className="relative pl-6 ml-2 border-l-2 border-gray-100 flex flex-col gap-6">
              {(order.statusTimeline || []).map((evt, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full bg-white border-2 border-primary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{evt.status}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{evt.date} at {evt.time}</span>
                      <span className="text-[10px] text-primary font-bold">by {evt.adminName}</span>
                    </div>
                    {evt.remarks && (
                      <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{evt.remarks}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column: Customer, addresses and notes */}
        <div className="flex flex-col gap-6">
          {/* Customer details */}
          <Card>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FiUser size={16} className="text-primary" />
              Customer details
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs">
                  {customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{customerName}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Customer account</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiMail size={13} className="text-gray-400" />
                <span className="font-semibold">{order.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiPhone size={13} className="text-gray-400" />
                <span className="font-semibold">{order.phone}</span>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FiMapPin size={16} className="text-primary" />
              Shipping Destination
            </h3>
            {order.shippingAddress ? (
              <div className="flex flex-col gap-1 text-xs text-gray-650 font-medium leading-relaxed">
                <p className="font-bold text-gray-800 text-sm mb-1">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                {order.shippingAddress.phone && (
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Contact: {order.shippingAddress.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No address details mapped.</p>
            )}
          </Card>

          {/* Payment Status Summary */}
          <Card>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FiDollarSign size={16} className="text-primary" />
              Transaction Ledger
            </h3>
            <div className="flex flex-col gap-2.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-bold text-gray-800 uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment status</span>
                <span className="font-bold text-gray-800 capitalize">{order.paymentStatus}</span>
              </div>
              {order.transactionRef && (
                <div className="flex justify-between">
                  <span>Reference ID</span>
                  <span className="font-bold text-primary font-mono">{order.transactionRef}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Internal Private Notes */}
          <Card>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FiClipboard size={16} className="text-primary" />
              Private Internal Notes
            </h3>
            <div className="flex flex-col gap-3">
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Only visible to administrators..."
                className="w-full p-2 border rounded-large text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[85px] bg-yellow-50/20"
              />
              <Button onClick={handleSaveNotes} size="sm" className="w-full flex items-center justify-center gap-1.5">
                <FiSave size={13} /> Save Internal Note
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
