import React from 'react';
import { Card, Table, Badge } from '../../../../shared/components/Common';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiDollarSign, 
  FiPercent, 
  FiBox, 
  FiEye, 
  FiAlertTriangle, 
  FiStar, 
  FiZap 
} from 'react-icons/fi';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { orders = [], products = [], coupons = [], dashboardStats } = useApp();

  // Dynamic Sales Calculation from non-cancelled orders
  const totalSalesAmount = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const activeCouponsCount = coupons.filter(c => c.status === 'Active').length;

  const metrics = [
    { label: 'Total Users', value: (dashboardStats?.totalUsers || 0).toLocaleString(), icon: FiUsers, color: 'bg-blue-100 text-blue-700', link: '/admin/customers' },
    { label: 'Total Orders', value: orders.length.toLocaleString(), icon: FiShoppingBag, color: 'bg-yellow-100 text-yellow-700', link: '/admin/orders' },
    { label: 'Total Sales', value: `₹${totalSalesAmount.toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'bg-green-100 text-green-700', link: '/admin/analytics' },
    { label: 'Active Coupons', value: activeCouponsCount.toLocaleString(), icon: FiPercent, color: 'bg-purple-100 text-purple-700', link: '/admin/coupons' }
  ];

  // Dynamic Product Catalog Metrics derived from current context state
  const productMetrics = [
    { label: 'Total Products', value: products.length, icon: FiBox, color: 'bg-indigo-100 text-indigo-700', link: '/admin/products' },
    { label: 'Active Products', value: products.filter(p => p.status === 'Active' || p.status === undefined).length, icon: FiEye, color: 'bg-emerald-100 text-emerald-700', link: '/admin/products' },
    { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: FiAlertTriangle, color: 'bg-rose-100 text-rose-700', link: '/admin/products' },
    { label: 'New Arrivals', value: products.filter(p => p.isNewArrival).length, icon: FiZap, color: 'bg-sky-100 text-sky-700', link: '/admin/products' },
    { label: 'Featured Products', value: products.filter(p => p.isFeatured).length, icon: FiStar, color: 'bg-amber-100 text-amber-750', link: '/admin/products' }
  ];

  // Dynamic Sales Trend based on last 7 days of orders
  const getSalesTrendData = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateKey = d.toDateString();
      days.push({ name: dayName, dateKey, sales: 0 });
    }

    orders.forEach(order => {
      if (order.status === 'Cancelled') return;
      const orderDate = new Date(order.createdAt || order.date);
      const dateKey = orderDate.toDateString();
      const dayObj = days.find(day => day.dateKey === dateKey);
      if (dayObj) {
        dayObj.sales += (order.total || 0);
      }
    });

    return days.map(({ name, sales }) => ({ name, sales }));
  };

  const salesData = getSalesTrendData();

  // Dynamic Category Distribution based on Sales value or inventory item counts as fallback
  const getCategoryData = () => {
    const categorySales = {};
    let hasSales = false;

    orders.forEach(order => {
      if (order.status === 'Cancelled') return;
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId || p.name === item.name);
        const cat = product?.category || 'Others';
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.qty);
        hasSales = true;
      });
    });

    const dataMap = hasSales ? categorySales : {};
    if (!hasSales) {
      // Fallback: inventory count per category
      products.forEach(p => {
        const cat = p.category || 'Others';
        dataMap[cat] = (dataMap[cat] || 0) + 1;
      });
    }

    const total = Object.values(dataMap).reduce((sum, val) => sum + val, 0) || 1;
    const colors = {
      Sofa: '#A66A2C',
      Chair: '#2B2B2B',
      Bed: '#F59E0B',
      Tables: '#22C55E',
      Dining: '#3B82F6',
      Storage: '#8B5CF6',
      Others: '#9CA3AF'
    };

    return Object.keys(dataMap).map(name => {
      const val = dataMap[name];
      const percentage = Math.round((val / total) * 100);
      return {
        name,
        value: val,
        percentage,
        color: colors[name] || colors.Others
      };
    }).sort((a, b) => b.value - a.value);
  };

  const categoryData = getCategoryData();

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="mb-2">
        <h1 className="text-2xl font-black text-gray-800">Dashboard</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Daily Performance Overview</p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Link key={i} to={m.link} className="block group">
              <Card className="flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer bg-white">
                <span className={`p-3.5 rounded-full ${m.color} group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase group-hover:text-primary transition-colors">{m.label}</p>
                  <h4 className="text-xl font-extrabold text-gray-800 mt-0.5">{m.value}</h4>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Product Catalog Metrics Grid */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Inventory Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {productMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link key={i} to={m.link} className="block group">
                <Card className="flex items-center gap-3 p-4 border border-gray-150 shadow-sm bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  <span className={`p-2.5 rounded-full ${m.color} group-hover:scale-105 transition-transform duration-200`}>
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase group-hover:text-primary transition-colors">{m.label}</p>
                    <h4 className="text-base font-extrabold text-gray-800 mt-0.5">{m.value}</h4>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 flex flex-col h-[320px] shadow-sm border-gray-100">
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
        <Card className="flex flex-col h-[320px] shadow-sm border-gray-100">
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
                <span>{entry.name} ({entry.percentage}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="flex flex-col gap-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-sm">Recent Orders</h3>
        <Table
          headers={['Order ID', 'Customer', 'Order Date', 'Total Amount', 'Status']}
          data={orders}
          renderRow={(row, i) => {
            const displayId = row.orderId || row.id;
            const customerName = row.customerName || row.customer;
            const displayDate = row.createdAt ? new Date(row.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : (row.date || 'N/A');
            return (
              <tr key={displayId || i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-primary">
                  <Link to={`/admin/orders/${row.orderId || row.id}`} className="hover:underline">
                    #{displayId}
                  </Link>
                </td>
                <td className="px-6 py-4 font-semibold">{customerName}</td>
                <td className="px-6 py-4">{displayDate}</td>
                <td className="px-6 py-4 font-bold">₹{(row.total || 0).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <Badge status={row.status === 'Delivered' ? 'success' : row.status === 'Shipped' ? 'info' : 'warning'}>
                    {row.status}
                  </Badge>
                </td>
              </tr>
            );
          }}
        />
      </Card>
    </div>
  );
}