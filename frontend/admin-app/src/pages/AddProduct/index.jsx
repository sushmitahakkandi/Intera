import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, Input, Textarea, Dropdown, Button } from '../../../../shared/components/Common';
import ImageUploadZone from '../../components/ImageUploadZone/ImageUploadZone';
import { toast } from 'react-hot-toast';

export default function AddProduct() {
  const { setProducts, categories } = useApp();
  const navigate = useNavigate();
  const [uploadedMedia, setUploadedMedia] = useState({ images: [], thumbnail: '' });
  const [form, setForm] = useState({
    name: '',
    category: 'Sofa',
    price: '',
    stock: '',
    material: '',
    dimensions: '',
    description: ''
  });

  const handleUploadComplete = (data) => {
    setUploadedMedia(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: 'p' + Math.random().toString(36).substr(2, 9),
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      material: form.material,
      dimensions: form.dimensions,
      description: form.description,
      image: uploadedMedia.thumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
      images: uploadedMedia.images.length > 0 ? uploadedMedia.images : [uploadedMedia.thumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'],
      rating: 5.0,
      reviewsCount: 0,
      discount: 0
    };
    setProducts(prev => [newProduct, ...prev]);
    toast.success('Product Added Successfully!');
    navigate('/admin/products');
  };

  const catOptions = categories.map(cat => ({ value: cat.name, label: cat.name }));

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Add New Product</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Populate product parameters</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Product Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          
          <div className="grid grid-cols-2 gap-4">
            <Dropdown label="Category" options={catOptions} value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} />
            <Input label="Price (INR)" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Units" type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} required />
            <Input label="Material" value={form.material} onChange={(e) => setForm({...form, material: e.target.value})} />
          </div>

          <Input label="Dimensions (WxDxH)" value={form.dimensions} onChange={(e) => setForm({...form, dimensions: e.target.value})} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          
          <div className="border-t border-gray-100 pt-4 my-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Gallery (AWS S3)</label>
            <ImageUploadZone productName={form.name} category={form.category} onUploadComplete={handleUploadComplete} />
          </div>
          
          <Button type="submit" className="w-fit self-end mt-4">Save Product</Button>
        </form>
      </Card>
    </div>
  );
}