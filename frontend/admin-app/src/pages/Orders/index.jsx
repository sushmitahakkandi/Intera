import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Table, Badge, Button, Input } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FiSearch, FiSliders, FiEye, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Orders() {
  const { token } = useApp();

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Load orders from server
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/orders`, {
        params: {
          page,
          limit: 10,
          search,
          status,
          paymentStatus,
          sortBy
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(res.data.orders || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotalCount(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to load orders catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token, page, status, paymentStatus, sortBy]);

  // Real-time synchronization
  useEffect(() => {
    const socket = io(API_BASE);
    socket.on('connect', () => {
      console.log('Admin socket connected in Orders listing');
    });

    socket.on('catalog_changed', () => {
      loadOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, [page, search, status, paymentStatus, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  // Enforce valid linear status options in dropdown
  const getAllowedStatusOptions = (currentStatus) => {
    const transitions = {
      'Pending': ['Pending', 'Confirmed', 'Cancelled'],
      'Confirmed': ['Confirmed', 'Processing', 'Cancelled'],
      'Processing': ['Processing', 'Packed', 'Cancelled'],
      'Packed': ['Packed', 'Shipped', 'Cancelled'],
      'Shipped': ['Shipped', 'Out For Delivery'],
      'Out For Delivery': ['Out For Delivery', 'Delivered'],
      'Delivered': ['Delivered', 'Return Requested'],
      'Return Requested': ['Return Requested', 'Return Approved', 'Delivered'],
      'Return Approved': ['Return Approved', 'Returned'],
      'Returned': ['Returned', 'Refund Processing'],
      'Refund Processing': ['Refund Processing', 'Refund Completed'],
      'Cancelled': ['Cancelled'],
      'Refund Completed': ['Refund Completed']
    };

    const allowed = transitions[currentStatus] || [currentStatus];
    return allowed.map(st => ({ value: st, label: st }));
  };

  const handleStatusChange = async (order, newStatus) => {
    const displayId = order.orderId;
    if (order.status === newStatus) return;

    const confirm = window.confirm(`Are you sure you want to transition order #${displayId} from "${order.status}" to "${newStatus}"?`);
    if (!confirm) return;

    try {
      await axios.patch(`${API_BASE}/api/orders/status`, {
        orderId: displayId,
        status: newStatus,
        remarks: `Status updated by Admin to ${newStatus}.`
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(`Order #${displayId} advanced to "${newStatus}"`);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update order status.');
    }
  };

  const downloadInvoice = (orderId, invoiceNumber) => {
    window.open(`${API_BASE}/api/orders/invoice/${orderId}`, '_blank');
    toast.success(`Downloading invoice ${invoiceNumber}`);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Orders Management</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase">Handle incoming purchases ({totalCount} total)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by ID, Customer, Courier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-large text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-large text-xs bg-white text-gray-600 font-bold focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Return Requested">Return Requested</option>
            <option value="Return Approved">Return Approved</option>
            <option value="Returned">Returned</option>
            <option value="Refund Processing">Refund Processing</option>
            <option value="Refund Completed">Refund Completed</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-large text-xs bg-white text-gray-600 font-bold focus:outline-none cursor-pointer"
          >
            <option value="">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
            <option value="Refund Processing">Refund Processing</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-large text-xs bg-white text-gray-600 font-bold focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Value</option>
            <option value="lowest">Lowest Value</option>
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-bold text-sm">No orders found matching filters.</div>
        ) : (
          <>
            <Table
              headers={['Order ID', 'Customer details', 'Invoice No', 'Total Amount', 'Status', 'Fulfillment', 'Actions']}
              data={orders}
              renderRow={(row) => {
                const displayId = row.orderId || row._id;
                const statusOptions = getAllowedStatusOptions(row.status);
                const isDisabled = row.status === 'Cancelled' || row.status === 'Refund Completed';

                return (
                  <tr key={displayId} className="hover:bg-gray-50 border-b border-gray-50 text-xs">
                    <td className="px-6 py-4">
                      <Link to={`/admin/orders/${displayId}`} className="font-bold text-primary hover:underline">
                        #{displayId}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{row.customerName}</p>
                      <span className="text-gray-400 text-[10px] block">{row.email}</span>
                      <span className="text-gray-400 text-[10px] block">{row.phone}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-650">{row.invoiceNumber}</td>
                    <td className="px-6 py-4 font-extrabold text-gray-900">
                      Rs. {row.total.toLocaleString()}
                      <span className="text-[10px] text-gray-400 block font-normal capitalize">{row.paymentMethod} • {row.paymentStatus}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={
                        row.status === 'Delivered' || row.status === 'Refund Completed' ? 'success' :
                        ['Shipped', 'Out For Delivery', 'Return Approved'].includes(row.status) ? 'info' :
                        row.status === 'Cancelled' || row.status === 'Return Rejected' ? 'danger' :
                        'warning'
                      }>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 w-44">
                      <select
                        disabled={isDisabled}
                        value={row.status}
                        onChange={(e) => handleStatusChange(row, e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded-large text-xs font-semibold focus:outline-none bg-white cursor-pointer ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link to={`/admin/orders/${displayId}`}>
                        <Button size="sm" variant="ghost" className="p-1.5" title="View details">
                          <FiEye size={14} />
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" className="p-1.5" onClick={() => downloadInvoice(displayId, row.invoiceNumber)} title="Download Invoice">
                        <FiDownload size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              }}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
                <span className="text-xs text-gray-400 font-bold">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  >
                    <FiChevronLeft size={16} /> Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next <FiChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}