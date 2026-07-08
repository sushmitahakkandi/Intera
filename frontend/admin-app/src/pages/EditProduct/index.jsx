import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, Input, Textarea, Dropdown, Button } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';

export default function EditProduct() {
  const { id } = useParams();
  const { products, setProducts, categories } = useApp();
  const navigate = useNavigate();

  const prod = products.find(p => p.id === id) || products[0];

  const [form, setForm] = useState({
    name: prod?.name || '',
    category: prod?.category || 'Sofa',
    price: prod?.price || '',
    stock: prod?.stock || '',
    material: prod?.material || '',
    dimensions: prod?.dimensions || '',
    description: prod?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setProducts(prev => prev.map(p => p.id === prod.id ? {
      ...p,
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      material: form.material,
      dimensions: form.dimensions,
      description: form.description
    } : p));
    toast.success('Product updated successfully!');
    navigate('/admin/products');
  };

  const catOptions = categories.map(cat => ({ value: cat.name, label: cat.name }));

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Edit Product</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Modify product details</p>
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

          <Input label="Dimensions" value={form.dimensions} onChange={(e) => setForm({...form, dimensions: e.target.value})} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          
          <Button type="submit" className="w-fit self-end mt-4">Update Product</Button>
        </form>
      </Card>
    </div>
  );
}