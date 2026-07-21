import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, Input, Textarea, Dropdown, Button } from '../../../../shared/components/Common';
import ImageUploadZone from '../../components/ImageUploadZone/ImageUploadZone';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to pre-generate a standard MongoDB 24-character hexadecimal ObjectId
const generateObjectId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
};

export default function AddProduct() {
  const { fetchProducts } = useApp();
  const navigate = useNavigate();
  
  // Pre-generate productId on component mount so S3 files are placed cleanly in products/<category>/<product-id>/
  const [productId] = useState(() => generateObjectId());
  
  const [uploadedMedia, setUploadedMedia] = useState({
    thumbnail: '',
    front: '',
    side: '',
    back: '',
    top: '',
    lifestyle: '',
    materialCloseUp: '',
    dimensionImage: '',
    gallery: [],
    images360: [],
    materials: []
  });
  
  const [meta, setMeta] = useState({ categories: [], brands: [], materials: [], colors: [] });
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    subcategory: 'General',
    price: '',
    discountPrice: '0',
    stock: '',
    material: '',
    color: '',
    dimensions: '',
    weight: '15',
    sku: '',
    description: '',
    isFeatured: false,
    isTrending: false,
    isNewArrival: false,
    isBestSeller: false,
    isRecommended: false,
    isAIEligible: false,
    status: 'Active'
  });

  // Fetch metadata on mount
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/meta`);
        const data = res.data || { categories: [], brands: [], materials: [], colors: [] };
        setMeta(data);

        // Prepopulate with first choices
        setForm(f => ({
          ...f,
          category: data.categories[0]?._id || '',
          brand: data.brands[0]?._id || '',
          material: data.materials[0]?._id || '',
          color: data.colors[0]?._id || ''
        }));
      } catch (err) {
        console.error("Error loading metadata:", err);
        toast.error("Failed to load options from server");
      }
    };
    loadMeta();
  }, []);

  const handleUploadComplete = (data) => {
    setUploadedMedia(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.brand || !form.category || !form.material || !form.color || !form.price || !form.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Autogenerate SKU if empty
    const finalSku = form.sku.trim() || 'MHV-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const productPayload = {
      _id: productId, // Bind the pre-generated ObjectId
      name: form.name,
      sku: finalSku,
      brand: form.brand,
      category: form.category,
      subcategory: form.subcategory,
      price: parseFloat(form.price),
      discountPrice: parseFloat(form.discountPrice) || 0,
      stock: parseInt(form.stock),
      material: form.material,
      color: form.color,
      dimensions: form.dimensions || 'N/A',
      weight: parseFloat(form.weight) || 15,
      description: form.description || 'Product details coming soon.',
      thumbnail: uploadedMedia.thumbnail || 'products/general/thumbnail.webp',
      images: {
        front: uploadedMedia.front || 'products/general/thumbnail.webp',
        side: uploadedMedia.side || '',
        back: uploadedMedia.back || '',
        top: uploadedMedia.top || '',
        lifestyle: uploadedMedia.lifestyle || '',
        materialCloseUp: uploadedMedia.materialCloseUp || '',
        dimensionImage: uploadedMedia.dimensionImage || '',
        gallery: uploadedMedia.gallery || [],
        images360: uploadedMedia.images360 || [],
        materials: uploadedMedia.materials || []
      },
      isFeatured: form.isFeatured,
      isTrending: form.isTrending,
      isNewArrival: form.isNewArrival,
      isBestSeller: form.isBestSeller,
      isRecommended: form.isRecommended,
      isAIEligible: form.isAIEligible,
      status: form.status
    };

    try {
      const storedToken = localStorage.getItem('mhv_admin_token');
      await axios.post(`${API_BASE}/api/products`, productPayload, {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });
      toast.success('Product Added Successfully!');
      if (typeof fetchProducts === 'function') {
        await fetchProducts();
      }
      navigate('/admin/products');
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.response?.data?.error || 'Failed to add product');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Add New Product</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Populate product parameters</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label={<span>Product Name <span className="text-red-500">*</span></span>} 
            value={form.name} 
            onChange={(e) => setForm({...form, name: e.target.value})} 
            required 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Dropdown 
              label={<span>Category <span className="text-red-500">*</span></span>} 
              options={meta.categories.map(c => ({ value: c._id, label: c.name }))} 
              value={form.category} 
              onChange={(e) => setForm({...form, category: e.target.value})} 
              required 
            />
            <Dropdown 
              label={<span>Brand <span className="text-red-500">*</span></span>} 
              options={meta.brands.map(b => ({ value: b._id, label: b.name }))} 
              value={form.brand} 
              onChange={(e) => setForm({...form, brand: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Subcategory (Defaults to General)" value={form.subcategory} onChange={(e) => setForm({...form, subcategory: e.target.value})} required />
            <Input 
              label={<span>Price (INR) <span className="text-red-500">*</span></span>} 
              type="number" 
              value={form.price} 
              onChange={(e) => setForm({...form, price: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label={<span>Stock Units <span className="text-red-500">*</span></span>} 
              type="number" 
              value={form.stock} 
              onChange={(e) => setForm({...form, stock: e.target.value})} 
              required 
            />
            <Dropdown 
              label={<span>Material <span className="text-red-500">*</span></span>} 
              options={meta.materials.map(m => ({ value: m._id, label: m.name }))} 
              value={form.material} 
              onChange={(e) => setForm({...form, material: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Dropdown 
              label={<span>Color Theme <span className="text-red-500">*</span></span>} 
              options={meta.colors.map(c => ({ value: c._id, label: `${c.name} (${c.hex})` }))} 
              value={form.color} 
              onChange={(e) => setForm({...form, color: e.target.value})} 
              required 
            />
            <Input label="Weight (kg)" type="number" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label={<span>Dimensions (WxDxH) <span className="text-red-500">*</span></span>} 
              value={form.dimensions} 
              onChange={(e) => setForm({...form, dimensions: e.target.value})} 
              required 
            />
            <Input label="SKU (Optional)" placeholder="e.g. MHV-SKU123" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <Dropdown 
              label="Product Status" 
              options={[
                { value: 'Active', label: 'Active (Visible on Shop)' },
                { value: 'Inactive', label: 'Inactive (Hidden)' }
              ]} 
              value={form.status} 
              onChange={(e) => setForm({...form, status: e.target.value})} 
            />
            <Input label="Discount Price (INR)" type="number" value={form.discountPrice} onChange={(e) => setForm({...form, discountPrice: e.target.value})} />
          </div>

          <div className="border-t border-gray-100 pt-4 my-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Flags & Badges</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'isFeatured', label: 'Featured Product' },
                { key: 'isNewArrival', label: 'New Arrival' },
                { key: 'isTrending', label: 'Trending' },
                { key: 'isBestSeller', label: 'Best Seller' },
                { key: 'isRecommended', label: 'Recommended' },
                { key: 'isAIEligible', label: 'AI Eligible' }
              ].map(flag => (
                <label key={flag.key} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-large border border-gray-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form[flag.key]}
                    onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  {flag.label}
                </label>
              ))}
            </div>
          </div>

          <Textarea 
            label={<span>Description <span className="text-red-500">*</span></span>} 
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
            required 
          />
          
          <div className="border-t border-gray-100 pt-4 my-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Product Gallery (AWS S3)</label>
            <ImageUploadZone 
              productName={form.name} 
              category={meta.categories.find(c => c._id === form.category)?.name || 'General'} 
              productId={productId} 
              onUploadComplete={handleUploadComplete} 
            />
          </div>
          
          <Button type="submit" className="w-fit self-end mt-4">Save Product</Button>
        </form>
      </Card>
    </div>
  );
}