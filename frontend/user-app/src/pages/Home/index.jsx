import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CategoryCard } from '../../../../shared/components/Common';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { FiTruck, FiRotateCcw, FiShield, FiAward } from 'react-icons/fi';

export default function Home() {
  const { products, categories } = useApp();

  // Show top 4 products
  const featuredProducts = products.slice(0, 4);

  // New arrivals: sort products by createdAt descending, then take top 4
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Banner Section */}
      <section className="relative h-[480px] bg-secondary-hover overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"
          alt="Modern Home Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full text-white">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold font-sans leading-tight mb-4 drop-shadow-md">
              Design Your <span className="text-primary">Dream Space</span> with Perfect Furniture
            </h1>
            <p className="text-base text-gray-200 mb-8 max-w-sm drop-shadow-sm font-medium">
              Explore our curated collections of premium smart furniture for contemporary living.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-large font-bold text-sm transition-all duration-200"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white border border-gray-100 p-6 rounded-large shadow-sm">
          <div className="flex items-center gap-3.5">
            <FiTruck className="text-primary" size={28} />
            <div>
              <h5 className="font-bold text-sm text-gray-800">Free Delivery</h5>
              <p className="text-xs text-gray-400 font-medium">On all orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <FiRotateCcw className="text-primary" size={28} />
            <div>
              <h5 className="font-bold text-sm text-gray-800">Easy Returns</h5>
              <p className="text-xs text-gray-400 font-medium">30 days return window</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <FiShield className="text-primary" size={28} />
            <div>
              <h5 className="font-bold text-sm text-gray-800">Secure Payment</h5>
              <p className="text-xs text-gray-400 font-medium">100% secure checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <FiAward className="text-primary" size={28} />
            <div>
              <h5 className="font-bold text-sm text-gray-800">Best Quality</h5>
              <p className="text-xs text-gray-400 font-medium">Premium products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">Featured Categories</h2>
            <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">Explore by type</p>
          </div>
          <Link to="/collections" className="text-sm font-bold text-primary hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/shop?category=${cat.name}`}>
              <CategoryCard category={cat} />
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">New Arrivals</h2>
              <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">Freshly added collections</p>
            </div>
            <Link to="/shop" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <Link key={prod.id} to={`/product/${prod.id}`}>
                <ProductCard product={prod} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800">Best Sellers</h2>
          <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">Popular choices</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <Link key={prod.id} to={`/product/${prod.id}`}>
              <ProductCard product={prod} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}