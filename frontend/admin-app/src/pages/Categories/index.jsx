import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Table, Button, Input } from '../../../../shared/components/Common';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Categories() {
  const { categories, setCategories } = useApp();
  const [newCatName, setNewCatName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat = {
      id: 'c' + Math.random().toString(36).substr(2, 9),
      name: newCatName.trim(),
      count: 0,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80'
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    toast.success('Category created!');
  };

  const handleDelete = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Category removed');
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-10">
      <div className="flex-grow flex flex-col gap-6">
        <h1 className="text-2xl font-black text-gray-800">Categories</h1>
        <Card className="p-0 overflow-hidden">
          <Table
            headers={['Icon', 'Category Name', 'Products Count', 'Actions']}
            data={categories}
            renderRow={(row, i) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <img src={row.image} alt={row.name} className="w-8 h-8 rounded-full object-cover border" />
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">{row.name}</td>
                <td className="px-6 py-4">{row.count} items</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(row.id)} className="p-2 hover:bg-gray-100 rounded text-danger">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            )}
          />
        </Card>
      </div>

      <Card className="w-full md:w-80 h-fit">
        <h3 className="font-bold text-gray-800 text-sm border-b pb-3 mb-5">Create Category</h3>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <Input label="Category Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
          <Button type="submit" className="w-full flex justify-center items-center gap-1.5">
            <FiPlus size={16} /> Add Category
          </Button>
        </form>
      </Card>
    </div>
  );
}