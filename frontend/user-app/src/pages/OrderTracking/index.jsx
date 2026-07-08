import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Button } from '../../../../shared/components/Common';
import { FiCheck, FiTruck, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function OrderTracking() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || 'MHV123456';

  const steps = [
    { label: 'Order Placed', date: '20 July 2025', done: true, current: false },
    { label: 'Packed & Processed', date: '20 July 04:30 PM', done: true, current: false },
    { label: 'Shipped', date: '21 July 11:00 AM', done: true, current: false },
    { label: 'Out for Delivery', date: '22 July 03:00 AM', done: false, current: true },
    { label: 'Delivered', date: 'Pending', done: false, current: false }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
          <FiArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column: Timeline */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <Card className="p-6">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800">Order #{orderId}</h2>
              <p className="text-xs text-gray-400 font-semibold mt-1">Placed on 20 July 2025</p>
            </div>

            <div className="relative pl-8 ml-4 border-l-2 border-gray-100 flex flex-col gap-8">
              {steps.map((st, i) => (
                <div key={i} className="relative">
                  {/* Status Indicator circle */}
                  <span className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                    st.done
                      ? 'bg-green-500 border-green-100 text-white'
                      : st.current
                      ? 'bg-primary border-primary-light text-white animate-pulse'
                      : 'bg-white border-gray-100 text-gray-300'
                  }`}>
                    {st.done ? (
                      <FiCheck size={14} className="stroke-[3]" />
                    ) : st.current ? (
                      <FiTruck size={12} />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                    )}
                  </span>
                  <div>
                    <h4 className={`text-sm font-bold ${
                      st.done || st.current ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {st.label}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">
                      {st.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column: Map mockup */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <Card className="flex-grow p-6 flex flex-col min-h-[400px] justify-between relative overflow-hidden bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Live Tracking Map</h3>
            
            {/* Styled interactive SVG Map graphic */}
            <div className="flex-grow flex items-center justify-center relative my-6">
              <svg width="100%" height="240" viewBox="0 0 400 240" className="w-full h-full max-w-sm">
                {/* Background Grid Lines */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Tracking Path Route */}
                <path
                  d="M 50,200 C 120,200 130,50 220,70 C 310,90 320,180 350,150"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 50,200 C 120,200 130,50 220,70"
                  fill="none"
                  stroke="var(--color-primary, #6b4e3d)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="6,4"
                />

                {/* Origin node */}
                <circle cx="50" cy="200" r="8" fill="#10b981" />
                <text x="35" y="222" className="text-[10px] font-bold fill-gray-500">Warehouse</text>

                {/* Current Truck position */}
                <g transform="translate(220, 70)">
                  {/* Status bubble */}
                  <foreignObject x="-45" y="-45" width="90" height="35">
                    <div className="bg-primary text-white text-[9px] font-bold py-1 px-2 rounded-large text-center shadow-md border border-primary-hover whitespace-nowrap">
                      Out for Delivery
                    </div>
                  </foreignObject>
                  {/* Outer Pulsing Aura */}
                  <circle cx="0" cy="0" r="14" fill="var(--color-primary-light, #f5efe6)" className="animate-ping opacity-60" />
                  <circle cx="0" cy="0" r="10" fill="var(--color-primary, #6b4e3d)" />
                  <circle cx="0" cy="0" r="6" fill="#fff" />
                </g>

                {/* Destination Node */}
                <circle cx="350" cy="150" r="8" fill="#3b82f6" />
                <text x="315" y="132" className="text-[10px] font-bold fill-gray-650">Home Address</text>
              </svg>
            </div>

            <div className="border-t border-gray-150 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
              <div>
                <span className="text-gray-450 uppercase block text-[10px]">Current Location</span>
                <span className="text-gray-700 text-sm font-bold">Davanagere Area 4</span>
              </div>
              <div>
                <span className="text-gray-450 uppercase block text-[10px]">Estimated Delivery</span>
                <span className="text-primary text-sm font-bold">Today, by 4:00 PM</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}