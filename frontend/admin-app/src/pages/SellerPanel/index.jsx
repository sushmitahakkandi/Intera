import React from 'react';
import { Card } from '../../../../shared/components/Common';

export default function SellerPanel() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Seller Panel</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Partner Seller Dashboard</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <h5 className="text-xs text-gray-400 font-bold uppercase">Total Products</h5>
          <h2 className="text-3xl font-extrabold text-gray-800 mt-2">56</h2>
        </Card>
        <Card className="p-6 text-center">
          <h5 className="text-xs text-gray-400 font-bold uppercase">Total Orders</h5>
          <h2 className="text-3xl font-extrabold text-gray-800 mt-2">128</h2>
        </Card>
        <Card className="p-6 text-center">
          <h5 className="text-xs text-gray-400 font-bold uppercase">Total Earnings</h5>
          <h2 className="text-3xl font-extrabold text-primary mt-2">₹3,45,670</h2>
        </Card>
      </div>
    </div>
  );
}