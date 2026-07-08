import React, { useState } from 'react';
import { Card, Table, Badge } from '../../../../shared/components/Common';

export default function Customers() {
  const [customers, setCustomers] = useState([
    { name: 'Basavaraj H G', email: 'basavaraj@gmail.com', role: 'Customer', status: 'Active' },
    { name: 'Sneha M', email: 'sneha@gmail.com', role: 'Customer', status: 'Active' },
    { name: 'Rahul R', email: 'rahul@gmail.com', role: 'Customer', status: 'Active' },
    { name: 'Anitha P', email: 'anitha@gmail.com', role: 'Customer', status: 'Blocked' }
  ]);

  const handleToggleBlock = (index) => {
    setCustomers(prev => prev.map((c, i) => i === index ? { ...c, status: c.status === 'Active' ? 'Blocked' : 'Active' } : c));
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Customers</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Manage registered users</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Customer Name', 'Email Address', 'Role', 'Status', 'Actions']}
          data={customers}
          renderRow={(row, i) => (
            <tr key={i} className="hover:bg-gray-50 border-b border-gray-50 text-sm">
              <td className="px-6 py-4 font-bold text-gray-800">{row.name}</td>
              <td className="px-6 py-4 text-gray-600">{row.email}</td>
              <td className="px-6 py-4 font-semibold text-gray-500">{row.role}</td>
              <td className="px-6 py-4">
                <Badge status={row.status === 'Active' ? 'success' : 'danger'}>
                  {row.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleToggleBlock(i)}
                  className={`text-xs font-bold hover:underline ${row.status === 'Active' ? 'text-danger' : 'text-green-600'}`}
                >
                  {row.status === 'Active' ? 'Block Account' : 'Activate Account'}
                </button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}