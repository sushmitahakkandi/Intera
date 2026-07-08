import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge } from '../../../../shared/components/Common';
import { Link } from 'react-router-dom';

export default function Orders() {
  const { orders } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">My Orders</h1>

      <div className="flex flex-col gap-6">
        {orders.map((ord) => (
          <Card key={ord.id} className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3 text-xs font-bold text-gray-500">
              <div>
                <span>Order Placed: </span>
                <span className="text-gray-800">{ord.date}</span>
              </div>
              <div>
                <span>Order ID: </span>
                <span className="text-gray-800">#{ord.id}</span>
              </div>
              <Badge status={ord.status === 'Delivered' ? 'success' : ord.status === 'Shipped' ? 'info' : 'warning'}>
                {ord.status}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-2">
              {ord.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-700">{item.name} <span className="text-xs text-gray-400 font-medium">x{item.qty}</span></span>
                  <span className="text-gray-800">₹{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex items-center justify-between">
              <div className="text-sm font-bold text-gray-800">
                Total Paid: <span className="text-primary">₹{ord.total.toLocaleString()}</span>
              </div>
              <Link to={`/order-tracking?orderId=${ord.id}`}>
                <Button size="sm" variant="outline">Track Order</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}