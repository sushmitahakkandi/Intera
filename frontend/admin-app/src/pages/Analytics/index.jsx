import React from 'react';
import { Card } from '../../../../shared/components/Common';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function Analytics() {
  const chartData = [
    { month: 'Jan', orders: 120, revenue: 140000 },
    { month: 'Feb', orders: 150, revenue: 180000 },
    { month: 'Mar', orders: 180, revenue: 220000 },
    { month: 'Apr', orders: 200, revenue: 240000 },
    { month: 'May', orders: 250, revenue: 310000 },
    { month: 'Jun', orders: 300, revenue: 450000 }
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Business Analytics</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Revenue & Volume tracking</p>
      </div>

      <Card className="h-[400px]">
        <h3 className="font-bold text-gray-800 text-sm mb-6">Revenue Performance (Monthly)</h3>
        <div className="w-full h-full text-xs pb-6">
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#A66A2C" name="Revenue (INR)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}