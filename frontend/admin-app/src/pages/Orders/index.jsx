import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Table, Badge, Dropdown } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';

export default function Orders() {
  const { orders, setOrders } = useApp();

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    toast.success('Order status updated!');
  };

  const statusOpts = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' }
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Orders Management</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Handle incoming purchases</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Order ID', 'Customer', 'Total Amount', 'Status', 'Update Status']}
          data={orders}
          renderRow={(row, i) => (
            <tr key={row.id} className="hover:bg-gray-50 border-b border-gray-50">
              <td className="px-6 py-4 font-bold text-primary">#{row.id}</td>
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-800">{row.customer}</p>
                <span className="text-xs text-gray-400">{row.email}</span>
              </td>
              <td className="px-6 py-4 font-extrabold text-gray-900">₹{row.total.toLocaleString()}</td>
              <td className="px-6 py-4">
                <Badge status={row.status === 'Delivered' ? 'success' : row.status === 'Shipped' ? 'info' : 'warning'}>
                  {row.status}
                </Badge>
              </td>
              <td className="px-6 py-4 w-48">
                <Dropdown
                  options={statusOpts}
                  value={row.status}
                  onChange={(e) => handleStatusChange(row.id, e.target.value)}
                  className="mb-0 py-1.5 text-xs font-semibold"
                />
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}