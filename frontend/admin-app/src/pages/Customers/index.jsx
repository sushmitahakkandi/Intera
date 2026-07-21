import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, Table, Badge } from '../../../../shared/components/Common';
import { FiSearch, FiLoader } from 'react-icons/fi';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: {
          page,
          limit: 10,
          search: searchTerm
        }
      });
      setCustomers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCustomers(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [page, searchTerm]);

  const handleToggleBlock = async (user) => {
    try {
      const newStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';
      const res = await api.put(`/users/${user._id}/status`, {
        status: newStatus
      });

      if (res.status === 200) {
        setCustomers(prev => prev.map(c => c._id === user._id ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      console.error('Error toggling customer status:', err);
      alert('Failed to update customer status');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Customers</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase">Manage registered users</p>
        </div>
      </div>

      {/* Search and Metadata Panel */}
      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#A66A2C] transition-colors"
          />
          <FiSearch className="absolute left-3 top-3.5 text-gray-400 text-lg" />
        </div>
        <div className="text-xs font-bold text-gray-500 mr-2">
          Total Customers: {totalCustomers.toLocaleString()}
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-gray-100">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 py-12">
              <FiLoader className="text-[#A66A2C] text-3xl animate-spin" />
            </div>
          )}
          
          <Table
            headers={['Customer Name', 'Email Address', 'Role', 'Status', 'Actions']}
            data={customers}
            renderRow={(row, i) => (
              <tr key={row._id || i} className="hover:bg-gray-50 border-b border-gray-50 text-sm">
                <td className="px-6 py-4 font-bold text-gray-800">{row.name}</td>
                <td className="px-6 py-4 text-gray-600">{row.email}</td>
                <td className="px-6 py-4 font-semibold text-gray-500 capitalize">{row.role}</td>
                <td className="px-6 py-4">
                  <Badge status={row.status === 'Active' ? 'success' : 'danger'}>
                    {row.status || 'Active'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleBlock(row)}
                    className={`text-xs font-bold hover:underline ${row.status === 'Active' || row.status === undefined ? 'text-danger' : 'text-green-600'}`}
                  >
                    {row.status === 'Active' || row.status === undefined ? 'Block Account' : 'Activate Account'}
                  </button>
                </td>
              </tr>
            )}
          />

          {!loading && customers.length === 0 && (
            <div className="text-center py-12 text-gray-500 font-semibold text-sm">
              No customers found.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white px-6 py-4 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-500">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}