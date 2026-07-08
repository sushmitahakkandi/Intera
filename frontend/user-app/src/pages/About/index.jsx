import React from 'react';
import { Card } from '../../../../shared/components/Common';
import { FiAward, FiShield, FiHeart, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function About() {
  const values = [
    {
      icon: <FiAward size={24} />,
      title: 'Premium Quality',
      desc: 'We source the highest-grade solid teak wood and fabrics to ensure each piece lasts for generations.'
    },
    {
      icon: <FiCpu size={24} />,
      title: 'Smart Innovation',
      desc: 'Integrating technology like modular charging, built-in organizers, and ergonomic adjustability.'
    },
    {
      icon: <FiShield size={24} />,
      title: 'Built to Last',
      desc: 'All structures undergo extensive load-testing. We support our quality with multi-year warranties.'
    },
    {
      icon: <FiHeart size={24} />,
      title: 'Customer-First',
      desc: 'From custom sizing options to direct doorstep assembly, we ensure a seamless delivery journey.'
    }
  ];

  return (
    <div className="pb-16">
      {/* Hero Header */}
      <section className="relative bg-secondary text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30 z-10" />
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
          alt="Luxury Furniture Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="max-w-4xl mx-auto relative z-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 font-sans drop-shadow-md">
            Our Furniture Narrative
          </h1>
          <p className="text-gray-200 text-sm max-w-xl mx-auto leading-relaxed drop-shadow-sm font-medium">
            Discover the philosophy behind Mahaveer. Crafting premium, tech-integrated, and highly functional furniture for the contemporary Indian home.
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-sm text-gray-500 font-medium leading-relaxed">
            <h2 className="text-3xl font-extrabold text-gray-800">Designed For Contemporary Luxury</h2>
            <p>
              Established with a vision to deliver unmatched woodcraft, Mahaveer Smart Furniture Hub is a leading destination for premium and intelligent interior design items. We believe furniture is not just functional; it shapes the soul of your home.
            </p>
            <p>
              Every product is handpicked and designed keeping in mind the comfort and lifestyle requirements of modern Indian households. By combining traditional carving artistry with space-saving mechanisms, we design future-proof layouts.
            </p>
          </div>
          <div className="rounded-large overflow-hidden border border-gray-150 shadow-md aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
              alt="Design philosophy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Core Values grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-gray-800">Our Core Pillars</h2>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">What we stand for</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Card className="flex flex-col gap-4 p-6 hover:shadow-md transition-shadow h-full bg-white">
                <span className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center shadow-sm">
                  {v.icon}
                </span>
                <h4 className="font-bold text-gray-800 text-sm">{v.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold">{v.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}