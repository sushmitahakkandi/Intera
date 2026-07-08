import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Table, Badge, Button } from '../../../../shared/components/Common';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Coupons() {
  const { coupons, setCoupons } = useApp();

  const handleToggle = (id) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c));
    toast.success('Coupon state toggled!');
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Coupons</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase">Manage discounts</p>
        </div>
        <Button size="sm" className="flex items-center gap-1"><FiPlus size={16} /> Create Coupon</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Promo Code', 'Discount Offer', 'Expiry Date', 'Status', 'Actions']}
          data={coupons}
          renderRow={(row, i) => (
            <tr key={row.id} className="hover:bg-gray-50 border-b border-gray-50">
              <td className="px-6 py-4 font-bold text-primary">{row.code}</td>
              <td className="px-6 py-4 font-semibold text-gray-700">{row.discount}</td>
              <td className="px-6 py-4 text-gray-500">{row.expiry}</td>
              <td className="px-6 py-4">
                <Badge status={row.status === 'Active' ? 'success' : 'danger'}>
                  {row.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleToggle(row.id)}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  Toggle Coupon
                </button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}