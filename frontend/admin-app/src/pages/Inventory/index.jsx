import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Pagination } from '../../../../shared/components/Common';
import { Link } from 'react-router-dom';
import { FiRefreshCw, FiSearch, FiSave, FiAlertCircle, FiTrendingUp, FiBox, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const CATEGORY_IMAGE_FALLBACKS = {
  Sofa: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp',
  Chair: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/chair/img-0.webp',
  Bed: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/bed/img-0.webp',
  Dining: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/dining/img-0.webp',
  Tables: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/tables/img-0.webp',
  Storage: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/storage/img-0.webp'
};

const getFallbackImage = (category) => CATEGORY_IMAGE_FALLBACKS[category] || CATEGORY_IMAGE_FALLBACKS.Sofa;

export default function Inventory() {
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  
  // Filtering and Searching states
  const [searchQuery, setSearchQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'inStock' | 'outOfStock' | 'lowStock'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Local stock adjustments state { [productId]: adjustedStockValue }
  const [stockChanges, setStockChanges] = useState({});

  // 1. Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/meta');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Error loading categories metadata:", err);
    }
  };

  // 2. Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: searchQuery,
        category: selectedCategory,
        sortBy: 'stock-low'
      };

      const response = await api.get('/products', { params });
      
      let fetchedProds = response.data.products || [];
      
      // Filter locally for out of stock / low stock / in stock if selected
      if (stockStatusFilter !== 'all') {
        fetchedProds = fetchedProds.filter(p => {
          if (stockStatusFilter === 'outOfStock') return p.stock === 0;
          if (stockStatusFilter === 'lowStock') return p.stock > 0 && p.stock < 5;
          if (stockStatusFilter === 'inStock') return p.stock >= 5;
          return true;
        });
      }

      setProductsList(fetchedProds);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.totalProducts || 0);
      
      // Reset local changes when page/category changes
      setStockChanges({});
    } catch (error) {
      toast.error('Failed to load inventory records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, stockStatusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Handle local change in stock number
  const handleStockLocalChange = (productId, val) => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed < 0) return;
    setStockChanges(prev => ({
      ...prev,
      [productId]: parsed
    }));
  };

  // Handle plus/minus buttons
  const adjustStockLocal = (product, amount) => {
    const currentVal = stockChanges[product._id] !== undefined ? stockChanges[product._id] : product.stock;
    const newVal = Math.max(0, currentVal + amount);
    setStockChanges(prev => ({
      ...prev,
      [product._id]: newVal
    }));
  };

  // Persist stock change to DB
  const saveStockChange = async (product) => {
    const newStock = stockChanges[product._id];
    if (newStock === undefined || newStock === product.stock) return;

    setSavingId(product._id);
    try {
      const payload = {
        stock: newStock,
        availability: newStock > 0 ? 'In Stock' : 'Out of Stock'
      };
      
      await api.put(`/products/${product._id}`, payload);
      toast.success(`${product.name} stock updated to ${newStock}!`);
      
      // Update local product list record to reflect changes
      setProductsList(prev => prev.map(p => {
        if (p._id === product._id) {
          return { ...p, stock: newStock, availability: payload.availability };
        }
        return p;
      }));

      // Remove from changes state
      setStockChanges(prev => {
        const copy = { ...prev };
        delete copy[product._id];
        return copy;
      });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update stock for ${product.name}`);
    } finally {
      setSavingId(null);
    }
  };

  // Reset local changes for a single product
  const discardStockChange = (productId) => {
    setStockChanges(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  // Categories Stats calculation
  const totalValuation = productsList.reduce((sum, p) => sum + ((p.discountPrice || p.price || 0) * p.stock), 0);
  const totalUnits = productsList.reduce((sum, p) => sum + (p.stock || 0), 0);
  const outOfStockCount = productsList.filter(p => p.stock === 0).length;
  const lowStockCount = productsList.filter(p => p.stock > 0 && p.stock < 5).length;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Inventory Management</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase">
            Real-time stock control and inventory updates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} className="flex items-center gap-1">
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="flex items-center gap-3 p-4 border border-gray-100 shadow-sm bg-white">
          <span className="p-2.5 rounded-full bg-blue-100 text-blue-700">
            <FiBox size={16} />
          </span>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Items Listed</p>
            <h4 className="text-base font-extrabold text-gray-800 mt-0.5">{productsList.length}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4 border border-gray-100 shadow-sm bg-white">
          <span className="p-2.5 rounded-full bg-indigo-100 text-indigo-700">
            <FiTrendingUp size={16} />
          </span>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Stock Units</p>
            <h4 className="text-base font-extrabold text-gray-800 mt-0.5">{totalUnits}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4 border border-gray-100 shadow-sm bg-white">
          <span className="p-2.5 rounded-full bg-rose-100 text-rose-700">
            <FiAlertCircle size={16} />
          </span>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Out of Stock</p>
            <h4 className="text-base font-extrabold text-gray-800 mt-0.5">{outOfStockCount}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4 border border-gray-100 shadow-sm bg-white">
          <span className="p-2.5 rounded-full bg-amber-100 text-amber-700">
            <FiAlertCircle size={16} />
          </span>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Low Stock Alerts</p>
            <h4 className="text-base font-extrabold text-gray-800 mt-0.5">{lowStockCount}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4 border border-gray-100 shadow-sm bg-white">
          <span className="p-2.5 rounded-full bg-green-100 text-green-700">
            <span className="font-bold text-sm">₹</span>
          </span>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Est. Stock Valuation</p>
            <h4 className="text-base font-extrabold text-gray-800 mt-0.5">₹{totalValuation.toLocaleString('en-IN')}</h4>
          </div>
        </Card>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedCategory(''); setPage(1); }}
            className={`px-4 py-2 rounded-large text-xs font-bold transition-all border shadow-sm ${
              !selectedCategory 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white text-gray-600 border-gray-250 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => { setSelectedCategory(c._id); setPage(1); }}
              className={`px-4 py-2 rounded-large text-xs font-bold transition-all border shadow-sm whitespace-nowrap ${
                selectedCategory === c._id 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-gray-600 border-gray-250 hover:bg-gray-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <Card className="p-4 bg-white border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-250 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 focus:bg-white"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>

        <div className="flex gap-2">
          {[
            { label: 'All Stock Levels', value: 'all' },
            { label: 'Low Stock (< 5)', value: 'lowStock' },
            { label: 'Out of Stock (0)', value: 'outOfStock' },
            { label: 'In Stock (5+)', value: 'inStock' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStockStatusFilter(opt.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-large text-xs font-bold border transition-all ${
                stockStatusFilter === opt.value
                  ? 'bg-secondary text-white border-secondary'
                  : 'bg-white text-gray-600 border-gray-250 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Inventory Table Card */}
      <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : productsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <FiBox size={40} />
            <p className="text-sm font-bold">No product stock listings match your criteria.</p>
          </div>
        ) : (
          <>
            <Table
              headers={[
                'Image', 
                'Product Details', 
                'SKU', 
                'Category', 
                'Unit Price', 
                'Stock Adjustment', 
                'Status', 
                'Action'
              ]}
              data={productsList}
              renderRow={(row) => {
                const isEdited = stockChanges[row._id] !== undefined;
                const currentStock = isEdited ? stockChanges[row._id] : row.stock;
                const isSaving = savingId === row._id;

                let stockStatusBadge = 'success';
                let stockStatusText = 'In Stock';
                if (currentStock === 0) {
                  stockStatusBadge = 'danger';
                  stockStatusText = 'Out of Stock';
                } else if (currentStock < 5) {
                  stockStatusBadge = 'warning';
                  stockStatusText = 'Low Stock';
                }

                return (
                  <tr key={row._id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <img 
                        src={
                          row.thumbnailUrl && !row.thumbnailUrl.includes('products/general/thumbnail.webp')
                            ? row.thumbnailUrl
                            : getFallbackImage(row.category?.name || 'Sofa')
                        } 
                        alt={row.name} 
                        className="w-12 h-12 object-cover rounded-large border bg-gray-50 shadow-sm" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{row.name}</p>
                        <p className="text-[10px] text-gray-450 font-bold uppercase">{row.brand?.name || 'Mahaveer'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">{row.sku}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-650 capitalize">{row.category?.name || 'Furniture'}</td>
                    <td className="px-6 py-4 font-extrabold text-gray-900">
                      ₹{row.discountPrice?.toLocaleString() || row.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustStockLocal(row, -1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-250 rounded hover:bg-gray-50 text-gray-600 font-bold focus:outline-none transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={currentStock}
                          onChange={(e) => handleStockLocalChange(row._id, e.target.value)}
                          className={`w-14 text-center py-1 border rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary ${
                            isEdited ? 'border-primary bg-primary-light/10 text-primary' : 'border-gray-250 text-gray-700'
                          }`}
                        />
                        <button
                          onClick={() => adjustStockLocal(row, 1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-250 rounded hover:bg-gray-50 text-gray-600 font-bold focus:outline-none transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-fit">
                        <Badge status={stockStatusBadge}>
                          {stockStatusText}
                        </Badge>
                        {currentStock < 5 && currentStock > 0 && (
                          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">
                            Reorder Soon
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isSaving ? (
                        <Spinner size="sm" />
                      ) : isEdited ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => saveStockChange(row)}
                            title="Save stock change"
                            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded shadow-sm hover:shadow transition-all"
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            onClick={() => discardStockChange(row._id)}
                            title="Cancel stock change"
                            className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-all"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <Link to={`/admin/edit-product/${row._id}`}>
                          <Button variant="outline" size="sm" className="text-xs py-1 px-2.5 font-bold h-auto border-gray-250">
                            Edit Item
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              }}
            />
            {totalPages > 1 && (
              <div className="border-t border-gray-100 p-2">
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  onPageChange={(p) => setPage(p)} 
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
