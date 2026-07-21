import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, Input, Textarea, Dropdown, Button } from '../../../../shared/components/Common';
import ImageUploadZone from '../../components/ImageUploadZone/ImageUploadZone';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const S3_BASE = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getDeterministicIndex = (str, range = 50) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % range;
};

const resolveImageSource = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  let cleanedKey = path.replace(/^\//, '');

  const segments = cleanedKey.split('/');
  if (segments[0] === 'products' && segments.length === 4) {
    const category = segments[1];
    const productSlug = segments[2];
    const index = getDeterministicIndex(productSlug, 50);
    cleanedKey = `cache/${category}/img-${index}.webp`;
  }
  
  return `${S3_BASE}/${cleanedKey}`;
};

export default function EditProduct() {
  const { id } = useParams();
  const { fetchProducts } = useApp();
  const navigate = useNavigate();

  const [meta, setMeta] = useState({ categories: [], brands: [], materials: [], colors: [] });
  const [imagesToDelete, setImagesToDelete] = useState([]);
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

  // Fetch metadata and product details
  useEffect(() => {
    const loadData = async () => {
      try {
        const metaRes = await axios.get(`${API_BASE}/api/meta`);
        const metaData = metaRes.data || { categories: [], brands: [], materials: [], colors: [] };
        setMeta(metaData);

        const prodRes = await axios.get(`${API_BASE}/api/products/${id}`);
        const prod = prodRes.data;

        if (prod) {
          setForm({
            name: prod.name || '',
            brand: prod.brand?._id || prod.brand || '',
            category: prod.category?._id || prod.category || '',
            subcategory: prod.subcategory || 'General',
            price: prod.price || '',
            discountPrice: prod.discountPrice || '0',
            stock: prod.stock || '',
            material: prod.material?._id || prod.material || '',
            color: prod.color?._id || prod.color || '',
            dimensions: prod.dimensions || '',
            weight: prod.weight || '15',
            sku: prod.sku || '',
            description: prod.description || '',
            isFeatured: prod.isFeatured || false,
            isTrending: prod.isTrending || false,
            isNewArrival: prod.isNewArrival || false,
            isBestSeller: prod.isBestSeller || false,
            isRecommended: prod.isRecommended || false,
            isAIEligible: prod.isAIEligible || false,
            status: prod.status || 'Active'
          });

          setUploadedMedia({
            thumbnail: prod.thumbnail || '',
            front: prod.images?.front || '',
            side: prod.images?.side || '',
            back: prod.images?.back || '',
            top: prod.images?.top || '',
            lifestyle: prod.images?.lifestyle || '',
            materialCloseUp: prod.images?.materialCloseUp || '',
            dimensionImage: prod.images?.dimensionImage || '',
            gallery: prod.images?.gallery || [],
            images360: prod.images?.images360 || [],
            materials: prod.images?.materials || []
          });
        }
      } catch (err) {
        console.error("Error fetching product or metadata:", err);
        toast.error("Failed to load product data from server");
      }
    };
    loadData();
  }, [id]);

  const handleUploadComplete = (newMedia) => {
    setUploadedMedia(prev => ({
      thumbnail: newMedia.thumbnail || prev.thumbnail,
      front: newMedia.front || prev.front,
      side: newMedia.side || prev.side,
      back: newMedia.back || prev.back,
      top: newMedia.top || prev.top,
      lifestyle: newMedia.lifestyle || prev.lifestyle,
      materialCloseUp: newMedia.materialCloseUp || prev.materialCloseUp,
      dimensionImage: newMedia.dimensionImage || prev.dimensionImage,
      gallery: [...prev.gallery, ...newMedia.gallery],
      images360: [...prev.images360, ...newMedia.images360],
      materials: [...prev.materials, ...newMedia.materials]
    }));
  };

  const removeExistingImage = (field, url) => {
    setImagesToDelete(prev => [...prev, url]);
    setUploadedMedia(prev => {
      if (field === 'gallery') {
        return { ...prev, gallery: prev.gallery.filter(x => x !== url) };
      }
      if (field === 'images360') {
        return { ...prev, images360: prev.images360.filter(x => x !== url) };
      }
      if (field === 'materials') {
        return { ...prev, materials: prev.materials.filter(x => x !== url) };
      }
      return { ...prev, [field]: '' };
    });
    toast.success(`Marked image for deletion`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.brand || !form.category || !form.material || !form.color || !form.price || !form.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    const productPayload = {
      name: form.name,
      sku: form.sku,
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
      description: form.description || '',
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
      status: form.status,
      imagesToDelete // Sends queue of old URLs to clean up from S3
    };

    try {
      const storedToken = localStorage.getItem('mhv_admin_token');
      await axios.put(`${API_BASE}/api/products/${id}`, productPayload, {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });
      toast.success('Product updated successfully!');
      if (typeof fetchProducts === 'function') {
        await fetchProducts();
      }
      navigate('/admin/products');
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.error || 'Failed to update product');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Edit Product</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Modify product details</p>
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
            <Input label="SKU (Read-only)" value={form.sku} readOnly />
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

          {/* Existing Images Display */}
          <div className="border-t border-gray-100 pt-4 my-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Existing S3 Images (Click delete to remove)</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-2 bg-gray-50 rounded-large border border-gray-200">
              {Object.entries(uploadedMedia).map(([field, val]) => {
                if (!val) return null;
                if (Array.isArray(val)) {
                  return val.map((url, i) => (
                    <div key={`${field}-${i}`} className="relative group border border-gray-200 rounded-large overflow-hidden bg-white aspect-square flex items-center justify-center p-1">
                      <img src={resolveImageSource(url)} alt={field} className="max-w-full max-h-full object-contain" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                        <span className="text-[8px] text-white font-bold truncate uppercase mb-1">{field} #{i+1}</span>
                        <button
                          type="button"
                          onClick={() => removeExistingImage('gallery', url)}
                          className="w-full py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ));
                }
                
                return (
                  <div key={field} className="relative group border border-gray-200 rounded-large overflow-hidden bg-white aspect-square flex items-center justify-center p-1">
                    <img src={resolveImageSource(val)} alt={field} className="max-w-full max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                      <span className="text-[8px] text-white font-bold truncate uppercase mb-1">{field}</span>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(field, val)}
                        className="w-full py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 my-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Additional/New Images (AWS S3)</label>
            <ImageUploadZone 
              productName={form.name} 
              category={meta.categories.find(c => c._id === form.category)?.name || 'General'} 
              productId={id} 
              onUploadComplete={handleUploadComplete} 
            />
          </div>
          
          <Button type="submit" className="w-fit self-end mt-4">Update Product</Button>
        </form>
      </Card>
    </div>
  );
}