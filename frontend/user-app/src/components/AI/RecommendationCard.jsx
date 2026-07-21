import React from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiArrowUpRight, FiHeart } from 'react-icons/fi';
import { LazyImage } from '../../../../shared/components/Common';
import { useApp } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RecommendationCard({ product, matchPercentage = 95, compatibility = null }) {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  
  const id = product.id || product._id;
  const name = product.name;
  const price = product.price;
  const image = product.image;
  const category = product.categoryGroup || (product.category?.name || product.category) || 'General';
  const rating = product.rating || 5.0;
  const explanation = product.explanation || (product.fitReasons ? product.fitReasons.join(' ') : '');
  const recScore = product.recommendationScore || matchPercentage;

  const handleAddToCart = async () => {
    // Normalise product structure for cart
    addToCart({
      id,
      name,
      price,
      image,
      category,
      rating,
      stock: product.stock || 5,
      material: product.material || 'Wood',
      colorName: product.colorName || 'Brown'
    });
    toast.success(`${name} added to cart!`);

    // Log conversion to analytics on server
    try {
      await axios.post(`${API_BASE}/api/assistant/conversion`, { productId: id });
    } catch (err) {
      console.error('Failed to log conversion event', err);
    }
  };

  const handleWishlist = () => {
    toggleWishlist({
      id,
      name,
      price,
      image,
      category,
      rating
    });
    toast.success(isInWishlist(id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  // Safe checks for explainable indicators
  const comp = compatibility || product.explainableAI || {};

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)' }}
      className="bg-white border border-gray-100 rounded-large overflow-hidden transition-all duration-300 flex flex-col justify-between h-[440px] relative shadow-premium group"
    >
      {/* Match Percentage Badge */}
      <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full z-10 shadow-sm flex items-center gap-1 font-sans">
        <span>{recScore}% Match</span>
      </div>

      {/* Heart/Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-4 right-4 p-2 rounded-full z-10 shadow-sm hover:scale-105 transition-all ${
          isInWishlist(id) ? 'bg-primary text-white' : 'bg-white/80 backdrop-blur-md text-gray-600 hover:text-primary'
        }`}
      >
        <FiHeart size={14} />
      </button>

      {/* Product Image */}
      <div className="relative h-44 overflow-hidden bg-gray-50 flex items-center justify-center">
        <LazyImage
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
              {category}
            </span>
            {/* Small Compatibility Badge Badges */}
            <div className="flex gap-1 text-[8px] font-extrabold uppercase">
              {comp.styleCompatibility && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100" title="Style match">
                  Style: {comp.styleCompatibility}
                </span>
              )}
              {comp.budgetCompatibility && (
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100" title="Budget match">
                  Budget: {comp.budgetCompatibility}
                </span>
              )}
            </div>
          </div>

          <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </h4>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-400">★</span>
            <span className="text-xs font-bold text-gray-600">{rating}</span>
          </div>
          {explanation && (
            <p className="text-[10px] text-gray-500 leading-relaxed mt-2 line-clamp-3">
              {explanation}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between border-t border-gray-50 pt-2.5 mt-2.5">
            <span className="text-base font-extrabold text-gray-800">
              ₹{(price || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] text-gray-400 font-semibold uppercase">
              {product.availability || 'In Stock'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3.5">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-3 rounded-large transition-all"
            >
              <FiShoppingCart size={13} />
              <span>Add</span>
            </button>
            <a
              href={`/product/${id}`}
              className="flex items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-2 px-3 rounded-large border border-gray-100 transition-all text-center"
            >
              <span>View</span>
              <FiArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
