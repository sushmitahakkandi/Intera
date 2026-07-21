import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Card, EmptyState, LazyImage } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { FiHeart, FiTrash2 } from 'react-icons/fi';

export default function Wishlist() {
  const { wishlistItems, addToCart, toggleWishlist } = useApp();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    toggleWishlist(product);
    toast.success(`Moved ${product.name} to Cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">
        My Wishlist ({wishlistItems.length})
      </h1>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((prod) => (
            <Card key={prod.id} className="flex flex-col gap-3 relative p-4 group">
              {/* Image Container */}
              <div className="aspect-[4/3] bg-gray-100 rounded-large overflow-hidden mb-2 relative">
                <LazyImage
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  loading="eager"
                  fetchPriority="high"
                />
                <button
                  onClick={() => {
                    toggleWishlist(prod);
                    toast.success('Removed from Wishlist');
                  }}
                  className="absolute top-2.5 right-2.5 p-2 bg-white rounded-full text-red-500 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>

              {/* Text Info */}
              <div className="flex-grow">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{prod.category}</span>
                <h4 className="font-bold text-gray-800 text-sm truncate mt-0.5">{prod.name}</h4>
                <div className="text-sm font-extrabold text-gray-900 mt-1">₹{prod.price.toLocaleString()}</div>
              </div>

              {/* Move to Cart Action Button */}
              <Button onClick={() => handleMoveToCart(prod)} className="w-full text-xs py-2">
                Move to Cart
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Wishlist is Empty"
          description="Browse our collections and tap the heart icon to save products here for later."
        />
      )}
    </div>
  );
}