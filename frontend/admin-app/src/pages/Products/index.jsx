import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Table, Button, Badge, Spinner, Pagination } from '../../../../shared/components/Common';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
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

export default function Products() {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState([]);
  const [meta, setMeta] = useState({ categories: [] });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        category: categoryFilter
      };
      
      const response = await api.get('/products', { params });
      setProductsList(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.totalProducts || 0);
    } catch (error) {
      toast.error('Failed to load products from server');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories metadata for bulk category switching
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/meta');
        setMeta(res.data || { categories: [] });
      } catch (err) {
        console.error("Error loading categories meta for bulk operations:", err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  // Reset selections when filters or page changes
  useEffect(() => {
    setSelectedIds([]);
  }, [page, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  // Selection handlers
  const isAllSelected = productsList.length > 0 && selectedIds.length === productsList.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(productsList.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Bulk action handlers
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete all ${selectedIds.length} selected products? This will also remove their S3 assets permanently.`)) return;
    try {
      await api.post('/products/bulk', { ids: selectedIds, action: 'delete' });
      toast.success('Selected products deleted successfully');
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to perform bulk deletion');
      console.error(err);
    }
  };

  const handleBulkStatusChange = async (status) => {
    try {
      await api.post('/products/bulk', { ids: selectedIds, action: 'status', value: status });
      toast.success(`Marked products as ${status}`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to change product status');
      console.error(err);
    }
  };

  const handleBulkCategoryChange = async (categoryId) => {
    try {
      await api.post('/products/bulk', { ids: selectedIds, action: 'category', value: categoryId });
      toast.success(`Moved selected products to new category`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to change category');
      console.error(err);
    }
  };

  const handleBulkPriceChangePrompt = async () => {
    const type = window.prompt('Enter price update type ("set", "percentage", or "fixed"):', 'percentage');
    if (!type || !['set', 'percentage', 'fixed'].includes(type)) {
      if (type) toast.error('Invalid price type. Must be set, percentage, or fixed.');
      return;
    }
    const amountStr = window.prompt(
      type === 'percentage'
        ? 'Enter percentage change (e.g., 10 for +10% markup, -5 for -5% discount):'
        : type === 'fixed'
        ? 'Enter fixed value change (e.g., 1000 for +1000 INR, -500 for -500 INR):'
        : 'Enter direct selling price to set (e.g., 15000):'
    );
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      toast.error('Invalid amount input');
      return;
    }
    try {
      await api.post('/products/bulk', { ids: selectedIds, action: 'price', value: { type, amount } });
      toast.success('Product prices updated successfully');
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update product prices');
      console.error(err);
    }
  };

  const handleBulkStockChangePrompt = async () => {
    const type = window.prompt('Enter stock update type ("set" or "adjust"):', 'set');
    if (!type || !['set', 'adjust'].includes(type)) {
      if (type) toast.error('Invalid stock type. Must be set or adjust.');
      return;
    }
    const amountStr = window.prompt(
      type === 'adjust'
        ? 'Enter count adjustment (e.g., 5 to add 5 units, -3 to subtract 3 units):'
        : 'Enter exact stock count to set (e.g., 20):'
    );
    const amount = parseInt(amountStr);
    if (isNaN(amount)) {
      toast.error('Invalid stock count input');
      return;
    }
    try {
      await api.post('/products/bulk', { ids: selectedIds, action: 'stock', value: { type, amount } });
      toast.success('Product stock updated successfully');
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update product stock');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Product Management</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase">
            Active Catalog: <span className="text-primary font-black">{totalProducts} Products</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} className="flex items-center gap-1">
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Link to="/admin/add-product">
            <Button size="sm" className="flex items-center gap-1">
              <FiPlus size={16} /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <Card className="p-4 bg-white border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 focus:bg-white"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => { setCategoryFilter(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              !categoryFilter 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {['Sofa', 'Chair', 'Bed', 'Dining', 'Tables', 'Storage'].map(cat => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(cat); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Products Table Card */}
      <Card className="p-0 overflow-hidden border-gray-100 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <Table
              headers={[
                <input 
                  type="checkbox" 
                  checked={isAllSelected} 
                  onChange={handleSelectAll} 
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer" 
                />,
                'Image', 
                'Product Name', 
                'SKU', 
                'Category', 
                'Price', 
                'Status & Stock', 
                'Actions'
              ]}
              data={productsList}
              renderRow={(row) => {
                const isSelected = selectedIds.includes(row._id);
                const handleSelectRow = (e) => {
                  if (e.target.checked) {
                    setSelectedIds(prev => [...prev, row._id]);
                  } else {
                    setSelectedIds(prev => prev.filter(id => id !== row._id));
                  }
                };

                return (
                  <tr key={row._id} className={`hover:bg-gray-50 border-b border-gray-50 transition-colors ${isSelected ? 'bg-primary-light/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={handleSelectRow} 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer" 
                      />
                    </td>
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
                    <td className="px-6 py-4 font-bold text-gray-850">
                      <div>
                        <p className="text-sm">{row.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{row.brand?.name || 'Mahaveer'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">{row.sku}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600 capitalize">{row.category?.name || 'Furniture'}</td>
                    <td className="px-6 py-4 font-extrabold text-gray-900">
                      <div>
                        <p className="text-sm">₹{row.discountPrice?.toLocaleString()}</p>
                        {row.discountPrice < row.price && (
                          <p className="text-[10px] text-gray-400 line-through">₹{row.price?.toLocaleString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-fit">
                        <Badge status={row.status === 'Active' ? 'success' : 'warning'}>
                          {row.status || 'Active'}
                        </Badge>
                        <Badge status={row.stock > 0 ? 'success' : 'danger'}>
                          {row.stock > 0 ? `${row.stock} in stock` : 'Out of stock'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/edit-product/${row._id}`}>
                          <button className="p-2 hover:bg-gray-100 rounded text-blue-600 transition-colors">
                            <FiEdit size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(row._id)}
                          className="p-2 hover:bg-gray-100 rounded text-danger transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
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

      {/* Floating Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-250 rounded-large px-6 py-4 flex flex-col md:flex-row items-center gap-4 animate-slide-up max-w-[95vw] md:max-w-4xl">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-extrabold text-gray-800">
              Selected: <span className="text-primary font-black">{selectedIds.length} Products</span>
            </span>
          </div>
          <div className="hidden md:block h-6 w-[1px] bg-gray-300" />
          
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Change Status Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusChange(e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-xs font-bold text-gray-750 bg-gray-100 hover:bg-gray-200 rounded-large px-3 py-1.5 border border-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="">Bulk Status...</option>
              <option value="Active">Set Active</option>
              <option value="Inactive">Set Inactive</option>
            </select>

            {/* Move Category Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkCategoryChange(e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-xs font-bold text-gray-750 bg-gray-100 hover:bg-gray-200 rounded-large px-3 py-1.5 border border-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="">Bulk Category...</option>
              {meta.categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <button
              onClick={handleBulkPriceChangePrompt}
              className="text-xs font-bold text-gray-750 bg-gray-100 hover:bg-gray-200 rounded-large px-3 py-1.5 border border-gray-200 cursor-pointer"
            >
              Bulk Price...
            </button>

            <button
              onClick={handleBulkStockChangePrompt}
              className="text-xs font-bold text-gray-750 bg-gray-100 hover:bg-gray-200 rounded-large px-3 py-1.5 border border-gray-200 cursor-pointer"
            >
              Bulk Stock...
            </button>

            <button
              onClick={handleBulkDelete}
              className="text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-large px-3 py-1.5 flex items-center gap-1 cursor-pointer"
            >
              <FiTrash2 size={12} /> Bulk Delete
            </button>

            <Button variant="outline" size="sm" onClick={() => setSelectedIds([])} className="h-[28px] border-gray-300">
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}