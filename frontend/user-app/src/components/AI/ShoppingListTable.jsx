import React from 'react';
import { FiShoppingBag, FiDownload } from 'react-icons/fi';

export default function ShoppingListTable({ items = [], totalCost = 0 }) {
  const handlePrint = () => {
    window.print();
  };

  if (!items.length) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-large shadow-premium overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <FiShoppingBag className="text-primary" size={15} />
          <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">
            Complete Shopping List
          </h4>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary border border-gray-200 hover:border-primary px-3 py-1.5 rounded-large transition-all print:hidden"
        >
          <FiDownload size={12} />
          Download List
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-5 py-3">#</th>
              <th className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-4 py-3">Product</th>
              <th className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-4 py-3">Category</th>
              <th className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-4 py-3 text-right">Match</th>
              <th className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-5 py-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.productId || idx}
                className="border-b border-gray-50 hover:bg-primary/[0.02] transition-colors"
              >
                <td className="px-5 py-3">
                  <span className="text-xs font-extrabold text-gray-300">{idx + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-large border border-gray-100 shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {item.categoryGroup || item.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-1 rounded-full ${
                      item.score >= 95
                        ? 'bg-green-50 text-green-700'
                        : item.score >= 90
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {item.score}%
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-xs font-extrabold text-gray-800">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-secondary/5 border-t-2 border-secondary/20">
              <td colSpan={3} className="px-5 py-4">
                <span className="text-xs font-extrabold text-secondary uppercase tracking-wider">
                  Estimated Total
                </span>
              </td>
              <td className="px-4 py-4 text-right" />
              <td className="px-5 py-4 text-right">
                <span className="text-base font-extrabold text-secondary">
                  ₹{Number(totalCost).toLocaleString('en-IN')}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
