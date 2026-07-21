import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FilterPanel, SearchBar, EmptyState } from '../../../../shared/components/Common';
import { ProductCard } from '../../components/ProductCard/ProductCard';

export default function Shop() {
  const { products, categories } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || null);
  const [searchVal, setSearchVal] = useState(searchParam || '');
  const [priceLimit, setPriceLimit] = useState(150000);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchVal(searchParam || '');
  }, [searchParam]);

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory ? prod.category.toLowerCase() === selectedCategory.toLowerCase() : true;
    const matchesPrice = prod.price <= priceLimit;
    const matchesSearch = searchVal
      ? prod.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchVal.toLowerCase())
      : true;

    return matchesCategory && matchesPrice && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return b.rating - a.rating; // Default 'popular' sort
  });

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <FilterPanel
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            currentPrice={priceLimit}
            onPriceChange={setPriceLimit}
          />
        </aside>

        {/* Product Catalog Grid */}
        <div className="flex-grow flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 p-4 rounded-large shadow-sm">
            <SearchBar
              placeholder="Search furniture items..."
              value={searchVal}
              onChange={setSearchVal}
            />
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-large text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="popular">Sort by Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                {sortedProducts.length} Items Found
              </span>
            </div>
          </div>

          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((prod) => (
                <Link key={prod.id} to={`/product/${prod.id}`}>
                  <ProductCard product={prod} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No furniture items found"
              description="Try adjusting your filters or price slider."
            />
          )}
        </div>
      </div>
    </div>
  );
}