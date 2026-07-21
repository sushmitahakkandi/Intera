import React from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { Card, Button, LazyImage } from '../../../../shared/components/Common';

export const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const wishlisted = isInWishlist(product.id);

  return (
    <Card hoverEffect className="flex flex-col h-full overflow-hidden group">
      <div className="relative aspect-square -mx-5 -mt-5 mb-4 overflow-hidden bg-gray-100">
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="eager"
          fetchPriority="high"
        />
        {product.discount > 0 && (
          <span className="absolute top-4 left-4 bg-danger text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {product.discount}% OFF
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors ${
            wishlisted ? 'text-red-500' : ''
          }`}
        >
          <FiHeart className={wishlisted ? 'fill-current' : ''} size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</span>
        <h4 className="font-semibold text-gray-800 line-clamp-1 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h4>
        <div className="flex items-center mb-3">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-xs font-semibold text-gray-700 ml-1">{product.rating}</span>
          <span className="text-xs text-gray-400 ml-1.5">({product.reviewsCount})</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</div>
            {product.originalPrice && (
              <div className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</div>
            )}
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="flex items-center gap-1"
          >
            <FiShoppingCart size={14} /> Add
          </Button>
        </div>
      </div>
    </Card>
  );
};
