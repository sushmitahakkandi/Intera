import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Table, Button, Badge } from '../../../../shared/components/Common';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Products() {
  const { products, setProducts } = useApp();

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted successfully');
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Product Management</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase">Manage store products</p>
        </div>
        <Link to="/admin/add-product">
          <Button size="sm" className="flex items-center gap-1">
            <FiPlus size={16} /> Add Product
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Image', 'Product Name', 'Category', 'Price', 'Stock', 'Status', 'Actions']}
          data={products}
          renderRow={(row, i) => (
            <tr key={row.id} className="hover:bg-gray-50 border-b border-gray-50">
              <td className="px-6 py-4">
                <img src={row.image} alt={row.name} className="w-10 h-10 object-cover rounded-large border" />
              </td>
              <td className="px-6 py-4 font-bold text-gray-800">{row.name}</td>
              <td className="px-6 py-4">{row.category}</td>
              <td className="px-6 py-4 font-extrabold text-gray-900">₹{row.price.toLocaleString()}</td>
              <td className="px-6 py-4 font-semibold">{row.stock}</td>
              <td className="px-6 py-4">
                <Badge status={row.stock > 0 ? 'success' : 'danger'}>
                  {row.stock > 0 ? 'Active' : 'Out of Stock'}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Link to={`/admin/edit-product/${row.id}`}>
                    <button className="p-2 hover:bg-gray-100 rounded text-blue-600 transition-colors">
                      <FiEdit size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="p-2 hover:bg-gray-100 rounded text-danger transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}