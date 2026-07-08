import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Card, Spinner, ErrorState } from '../../../../shared/components/Common';
import { FiHeart, FiShoppingCart, FiArrowLeft, FiStar, FiImage, FiRotateCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import ThreeSixtyViewer from '../../components/ThreeSixtyViewer/ThreeSixtyViewer';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist } = useApp();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [viewMode, setViewMode] = useState('standard'); // 'standard' | '360'
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  const product = products.find((p) => p.id === id) || products[0];

  if (!product) {
    return <ErrorState message="Could not find this product in our database." />;
  }

  const [mainImage, setMainImage] = useState(product.image);

  // Set the images array (mocking thumbnail gallery or pulling from product.images)
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [
        product.image,
        'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80'
      ];

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success(`Added ${qty} x ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  // Magnifying lens effect on hover
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${mainImage})`,
      left: `${e.nativeEvent.offsetX - 75}px`,
      top: `${e.nativeEvent.offsetY - 75}px`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // Get similar products
  const similarProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb / Navigation path */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
          <FiArrowLeft size={16} /> Back to Catalog
        </Link>
        <span className="text-xs font-semibold text-gray-400">
          Home / Shop / {product.category} / {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-16">
        {/* Product Media Column */}
        <div className="flex flex-col gap-4">
          {/* Mode Switch Tab Bar */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('standard')}
              className={`flex-1 py-2 text-xs font-bold rounded-large border transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'standard'
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiImage size={14} /> Standard Gallery
            </button>
            <button
              onClick={() => setViewMode('360')}
              className={`flex-1 py-2 text-xs font-bold rounded-large border transition-all flex items-center justify-center gap-1.5 ${
                viewMode === '360'
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiRotateCw size={14} /> 360° Viewer
            </button>
          </div>

          {viewMode === 'standard' ? (
            <>
              <div 
                className="relative aspect-[4/3] rounded-large overflow-hidden border border-gray-100 bg-white shadow-sm cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover transition-all duration-300" />
                <div 
                  className="absolute w-[150px] h-[150px] border-2 border-white rounded-full pointer-events-none shadow-premium bg-no-repeat bg-[length:400%_400%]"
                  style={zoomStyle}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`aspect-square rounded-large overflow-hidden border-2 bg-white transition-all ${
                      mainImage === img ? 'border-primary shadow-md' : 'border-gray-100 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumbnail-${i}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <ThreeSixtyViewer images={product.images360 || []} fallbackImage={product.image} />
          )}
        </div>

        {/* Product Info Column */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{product.category}</span>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-3">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className="fill-current" size={14} />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-400 font-semibold">({product.reviewsCount || 256} verified reviews)</span>
          </div>

          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-3xl font-extrabold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-gray-450 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-xs bg-danger text-white px-2.5 py-0.5 rounded-full font-bold">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed font-medium">{product.description}</p>

          <div className="border-t border-b border-gray-100 py-6 mb-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-gray-400 font-semibold uppercase">Material</span>
              <span className="text-gray-700 font-bold">{product.material}</span>
              
              <span className="text-gray-400 font-semibold uppercase">Dimensions</span>
              <span className="text-gray-700 font-bold">{product.dimensions}</span>

              <span className="text-gray-400 font-semibold uppercase">Availability</span>
              <span className="text-green-600 font-bold">In Stock ({product.stock || 20} items left)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-large overflow-hidden">
              <button
                onClick={() => qty > 1 && setQty(qty - 1)}
                className="px-3.5 py-2 text-gray-500 hover:bg-gray-50 font-bold"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold text-gray-800">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3.5 py-2 text-gray-500 hover:bg-gray-50 font-bold"
              >
                +
              </button>
            </div>

            <Button onClick={handleAddToCart} className="flex items-center gap-2">
              <FiShoppingCart size={16} /> Add to Cart
            </Button>

            <Button variant="secondary" onClick={handleBuyNow} className="px-6 py-2.5">
              Buy Now
            </Button>

            <button
              onClick={() => {
                toggleWishlist(product);
                toast.success(isLiked ? 'Removed from Wishlist' : 'Added to Wishlist');
              }}
              className={`p-3.5 border border-gray-200 rounded-large text-gray-500 hover:text-red-500 hover:bg-gray-50 transition-colors ${
                isLiked ? 'text-red-500 bg-red-50 border-red-200 shadow-sm' : ''
              }`}
            >
              <FiHeart size={20} className={isLiked ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs description / reviews / specs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {['description', 'reviews', 'specifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 py-4 px-1 text-sm font-bold capitalize transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'reviews' ? `Reviews (${product.reviewsCount || 256})` : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="mb-16">
        {activeTab === 'description' && (
          <div className="text-sm text-gray-600 leading-relaxed font-medium space-y-4 max-w-3xl">
            <p>{product.description}</p>
            <p>
              Comfort meets elegance. Perfect for your modern home and cozy living. Crafted by skilled artisans
              using the highest grade material, ensuring durability and timeless aesthetic value.
            </p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="border border-gray-100 p-5 rounded-large bg-gray-50 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 text-sm">Rating Summary</span>
                <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full font-bold">4.5 ★</span>
              </div>
              <p className="text-xs text-gray-400 font-semibold">98% of customers recommend this product</p>
            </div>
            
            <div className="flex flex-col gap-4 divide-y divide-gray-100">
              <div className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-800">Basavaraj H G</span>
                  <span className="text-xs text-gray-400">20 July 2025</span>
                </div>
                <div className="flex text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="fill-current" size={12} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 font-medium">Extremely comfortable and premium quality! Recommending it to everyone looking for a durable modern sofa.</p>
              </div>
              <div className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-800">Sneha M</span>
                  <span className="text-xs text-gray-400">18 July 2025</span>
                </div>
                <div className="flex text-yellow-500 mb-2">
                  {[...Array(4)].map((_, i) => (
                    <FiStar key={i} className="fill-current" size={12} />
                  ))}
                  <FiStar size={12} />
                </div>
                <p className="text-xs text-gray-500 font-medium">Very cozy sofa. The fabric feels great. Fits beautifully into our living room layout.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="max-w-md border border-gray-100 rounded-large overflow-hidden">
            <table className="w-full text-left text-xs font-semibold">
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">Material</td>
                  <td className="px-4 py-3 text-gray-800 font-bold">{product.material}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-400">Dimensions</td>
                  <td className="px-4 py-3 text-gray-800 font-bold">{product.dimensions}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">Weight Capacity</td>
                  <td className="px-4 py-3 text-gray-800 font-bold">350 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-400">Assembly Required</td>
                  <td className="px-4 py-3 text-gray-800 font-bold">Yes (Complimentary service)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800">Similar Products</h2>
            <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">You might also like</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((prod) => (
              <Link key={prod.id} to={`/product/${prod.id}`}>
                <ProductCard product={prod} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}