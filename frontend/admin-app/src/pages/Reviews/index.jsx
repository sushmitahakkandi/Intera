import React, { useState } from 'react';
import { Card, Table, Badge } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';

export default function Reviews() {
  const [reviews, setReviews] = useState([
    { product: 'Luxury Modern Sofa', customer: 'Basavaraj H G', rating: 5, comment: 'Great quality and extremely soft cushions!', status: 'Approved' },
    { product: 'Wooden Chair', customer: 'Sneha M', rating: 4, comment: 'Very sturdy, but delivery took 6 days.', status: 'Approved' },
    { product: 'Center Table', customer: 'Rahul R', rating: 5, comment: 'Elegant geometric glass table, loving it.', status: 'Approved' }
  ]);

  const handleApprove = (index) => {
    toast.success('Review approved successfully!');
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Reviews Management</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Manage user opinions</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Product', 'Customer', 'Rating', 'Comment', 'Status', 'Actions']}
          data={reviews}
          renderRow={(row, i) => (
            <tr key={i} className="hover:bg-gray-50 border-b border-gray-50">
              <td className="px-6 py-4 font-bold text-gray-800">{row.product}</td>
              <td className="px-6 py-4">{row.customer}</td>
              <td className="px-6 py-4 text-yellow-500 font-extrabold text-xs">{'★'.repeat(row.rating)}</td>
              <td className="px-6 py-4 text-xs italic text-gray-500">"{row.comment}"</td>
              <td className="px-6 py-4">
                <Badge status="success">{row.status}</Badge>
              </td>
              <td className="px-6 py-4">
                <button onClick={() => handleApprove(i)} className="text-xs font-bold text-primary hover:underline">
                  Refresh Review
                </button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}