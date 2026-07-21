import React from 'react';
import AIAvatar from './AIAvatar';
import { Avatar } from '@shared/components/Common';
import { FiVolume2, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import RecommendationCard from './RecommendationCard';

export default function ChatBubble({ message, userName = "User" }) {
  const { sender, text, timestamp, image, comparisonTable, budgetPackage, products, explainableAI } = message;
  const isAI = sender === 'ai';
  const { addToCart } = useApp();

  const speakText = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove any HTML tags or weird brackets if present
      const cleanText = text.replace(/[*#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      window.speechSynthesis.speak(utterance);
      toast.success("Playing audio narration...");
    } else {
      toast.error("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <div className={`flex gap-3.5 mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
      {/* Avatar (AI only) */}
      {isAI && (
        <div className="flex-shrink-0 mt-0.5">
          <AIAvatar size="sm" />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
        <div
          className={`p-4 rounded-large text-sm font-medium shadow-premium leading-relaxed relative ${
            isAI
              ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              : 'bg-primary text-white rounded-tr-none'
          }`}
        >
          {/* Attached image preview */}
          {image && (
            <div className="mb-2.5 rounded-large overflow-hidden border border-black/5 max-h-48">
              <img src={image} alt="Attached Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <p className="whitespace-pre-line text-xs sm:text-sm font-sans">{text}</p>

          {/* Render inline Comparison Table */}
          {isAI && comparisonTable && comparisonTable.comparisonMatrix?.length > 0 && (
            <div className="mt-4 border border-gray-100 rounded-large overflow-hidden bg-white max-w-full">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-3 font-bold text-gray-700">Feature</th>
                      {comparisonMatrixHeaders(comparisonTable.comparisonMatrix)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="p-2.5 font-semibold text-gray-500">Price</td>
                      {comparisonTable.comparisonMatrix.map((item, idx) => (
                        <td key={idx} className="p-2.5 font-bold text-gray-800">₹{item.price.toLocaleString('en-IN')}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-2.5 font-semibold text-gray-500">Material</td>
                      {comparisonTable.comparisonMatrix.map((item, idx) => (
                        <td key={idx} className="p-2.5 text-gray-700">{item.material}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-2.5 font-semibold text-gray-500">Dimensions</td>
                      {comparisonTable.comparisonMatrix.map((item, idx) => (
                        <td key={idx} className="p-2.5 text-gray-700">{item.dimensions}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-2.5 font-semibold text-gray-500">Warranty</td>
                      {comparisonTable.comparisonMatrix.map((item, idx) => (
                        <td key={idx} className="p-2.5 text-gray-700">{item.warranty}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-2.5 font-semibold text-gray-500">Comfort</td>
                      {comparisonTable.comparisonMatrix.map((item, idx) => (
                        <td key={idx} className="p-2.5 text-gray-700">{item.comfort}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-2.5 font-semibold text-gray-500">Rating</td>
                      {comparisonTable.comparisonMatrix.map((item, idx) => (
                        <td key={idx} className="p-2.5 text-gray-700">★ {item.rating} ({item.reviewsCount})</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-gray-500">Action</td>
                      {comparisonTable.comparisonMatrix.map((item, idx) => (
                        <td key={idx} className="p-2.5">
                          <button
                            onClick={() => {
                              addToCart(item);
                              toast.success(`${item.name} added to cart!`);
                            }}
                            className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold py-1 px-2 rounded flex items-center gap-1"
                          >
                            <FiShoppingCart size={11} /> Add
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-primary-light/10 border-t border-gray-50 text-[11px] font-semibold text-primary">
                {comparisonTable.recommendation?.text}
              </div>
            </div>
          )}

          {/* Render Budget Package Planner */}
          {isAI && budgetPackage && budgetPackage.package?.items?.length > 0 && (
            <div className="mt-4 p-4 border border-gray-100 rounded-large bg-white shadow-sm max-w-full font-sans">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-3">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  {budgetPackage.package.packageName}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-extrabold uppercase">
                  Target: ₹{budgetPackage.targetBudget.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="space-y-2">
                {budgetPackage.package.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500" size={13} />
                      <span className="font-bold text-gray-800 truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-gray-700">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-extrabold">
                <span className="text-gray-500">Total Price: ₹{budgetPackage.package.totalCost.toLocaleString('en-IN')}</span>
                <span className="text-emerald-600">Balance: ₹{budgetPackage.package.remainingBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Render inline Recommendations */}
          {isAI && products && products.length > 0 && (
            <div className="mt-4 flex gap-4 overflow-x-auto pb-3.5 scrollbar-thin pt-2 w-full max-w-full">
              {products.map((prod) => (
                <div key={prod._id || prod.id} className="flex-shrink-0 w-64">
                  <RecommendationCard
                    product={prod}
                    matchPercentage={prod.recommendationScore || (explainableAI?.[prod._id]?.matchPercentage || explainableAI?.[prod.id]?.matchPercentage || 95)}
                    compatibility={explainableAI?.[prod._id] || explainableAI?.[prod.id] || null}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer controls & Timestamp */}
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
            {timestamp}
          </span>
          {isAI && (
            <button
              onClick={speakText}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-primary transition-all"
              title="Speak message"
            >
              <FiVolume2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Avatar (User only) */}
      {!isAI && (
        <div className="flex-shrink-0 mt-0.5">
          <Avatar name={userName} size="sm" />
        </div>
      )}
    </div>
  );
}

function comparisonMatrixHeaders(matrix) {
  return matrix.map((item, idx) => (
    <th key={idx} className="p-3 font-bold text-gray-800 text-center max-w-[120px] truncate">
      {item.name}
    </th>
  ));
}
