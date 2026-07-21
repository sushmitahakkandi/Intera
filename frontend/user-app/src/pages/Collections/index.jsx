import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { LazyImage } from '../../../../shared/components/Common';

export default function Collections() {
  const { categories } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Our Signature Collections</h1>
        <p className="text-sm text-gray-400 font-medium max-w-md mx-auto">
          Explore our furniture ranges meticulously crafted to elevate the comfort of your modern space.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative h-80 rounded-large overflow-hidden group shadow-md"
          >
            {/* Background Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 z-10 transition-opacity duration-300" />
            <LazyImage
              src={cat.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Collection Metadata */}
            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end text-white">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                {cat.count || 12} Items
              </span>
              <h3 className="text-2xl font-bold mb-2">{cat.name} Collection</h3>
              <p className="text-xs text-gray-300 mb-4 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Premium quality designs tailored for contemporary aesthetic luxury and comfort.
              </p>
              <div>
                <Link
                  to={`/shop?category=${cat.name}`}
                  className="inline-block bg-white hover:bg-primary hover:text-white text-gray-900 text-xs font-bold px-5 py-2.5 rounded-large transition-colors duration-300 shadow-sm"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}