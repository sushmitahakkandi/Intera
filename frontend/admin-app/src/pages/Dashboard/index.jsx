import React from 'react';
import { Card, Table, Badge } from '../../../../shared/components/Common';
import { useApp } from '../../context/AppContext';
import { FiUsers, FiShoppingBag, FiDollarSign, FiPercent } from 'react-icons/fi';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { orders } = useApp();

  const metrics = [
    { label: 'Total Users', value: '1,256', icon: FiUsers, color: 'bg-blue-100 text-blue-700' },
    { label: 'Total Orders', value: '868', icon: FiShoppingBag, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Total Sales', value: '₹12,45,320', icon: FiDollarSign, color: 'bg-green-100 text-green-700' },
    { label: 'Active Coupons', value: '3', icon: FiPercent, color: 'bg-purple-100 text-purple-700' }
  ];

  const salesData = [
    { name: 'Mon', sales: 40000 },
    { name: 'Tue', sales: 65000 },
    { name: 'Wed', sales: 50000 },
    { name: 'Thu', sales: 85000 },
    { name: 'Fri', sales: 120000 },
    { name: 'Sat', sales: 90000 },
    { name: 'Sun', sales: 145000 }
  ];

  const categoryData = [
    { name: 'Sofa', value: 45, color: '#A66A2C' },
    { name: 'Chair', value: 20, color: '#2B2B2B' },
    { name: 'Bed', value: 15, color: '#F59E0B' },
    { name: 'Tables', value: 10, color: '#22C55E' },
    { name: 'Others', value: 10, color: '#9CA3AF' }
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="mb-2">
        <h1 className="text-2xl font-black text-gray-800">Dashboard</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Daily Performance Overview</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="flex items-center gap-4">
              <span className={`p-3.5 rounded-full ${m.color}`}>
                <Icon size={20} />
              </span>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">{m.label}</p>
                <h4 className="text-xl font-extrabold text-gray-800 mt-0.5">{m.value}</h4>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 flex flex-col h-[320px]">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Sales Trend</h3>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#A66A2C" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart */}
        <Card className="flex flex-col h-[320px]">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Top Categories</h3>
          <div className="flex-grow flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 flex-wrap text-[10px] font-bold text-gray-500 mt-2">
            {categoryData.map((entry, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="flex flex-col gap-4">
        <h3 className="font-bold text-gray-800 text-sm">Recent Orders</h3>
        <Table
          headers={['Order ID', 'Customer', 'Order Date', 'Total Amount', 'Status']}
          data={orders}
          renderRow={(row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-bold text-primary">#{row.id}</td>
              <td className="px-6 py-4 font-semibold">{row.customer}</td>
              <td className="px-6 py-4">{row.date}</td>
              <td className="px-6 py-4 font-bold">₹{row.total.toLocaleString()}</td>
              <td className="px-6 py-4">
                <Badge status={row.status === 'Delivered' ? 'success' : row.status === 'Shipped' ? 'info' : 'warning'}>
                  {row.status}
                </Badge>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}