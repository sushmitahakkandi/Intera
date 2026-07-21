import React from 'react';
import { FiLayers, FiMaximize2, FiGrid, FiFeather, FiBarChart2 } from 'react-icons/fi';

export default function FurnitureSuggestion({
  layoutText,
  categories = [],
  colors = [],
  materials = [],
  palette = [],
  confidenceBreakdown = {},
  overallConfidence = 0,
  roomFeatures = {},
  layoutPlan = {},
  spaceOptimizationTips = [],
  improvementScoreBefore = 0,
  improvementScoreAfter = 0,
  budgetOptions = [],
  premiumOptions = [],
  alternativeProducts = [],
  missingFurnitureSuggestions = []
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Recommended Layout & Dimensions */}
      <div className="bg-white border border-gray-100 rounded-large p-6 shadow-premium">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
          <div className="p-2 rounded-large bg-primary-light text-primary">
            <FiGrid size={18} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Recommended Furniture Layout</h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed font-medium mb-4">{layoutText}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 border border-gray-100 rounded-large p-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Improvement Score</p>
            <p className="text-sm font-extrabold text-gray-800">{improvementScoreBefore} → {improvementScoreAfter}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-large p-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Overall Confidence</p>
            <p className="text-sm font-extrabold text-gray-800">{overallConfidence}%</p>
          </div>
        </div>
        
        <div className="bg-primary-light/30 border border-primary-light/50 p-4 rounded-large">
          <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
            <FiMaximize2 size={13} /> Space Optimization Tips
          </h4>
          <ul className="list-disc pl-4 text-[11px] text-gray-600 font-medium space-y-1.5">
            {(spaceOptimizationTips.length > 0 ? spaceOptimizationTips : [
              'Place larger sofas against the longest wall to maximize walking space.',
              'Maintain at least 3 feet of clearance between paths and heavy furniture.',
              'Incorporate mirrors to reflect ambient light and expand the room visually.'
            ]).map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        {missingFurnitureSuggestions.length > 0 && (
          <div className="mt-4 bg-white border border-gray-100 rounded-large p-4">
            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <FiLayers size={13} className="text-primary" /> Missing Furniture Suggestions
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingFurnitureSuggestions.map((item, index) => (
                <span key={index} className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[11px] font-semibold text-gray-600">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Materials & Colors */}
      <div className="bg-white border border-gray-100 rounded-large p-6 shadow-premium flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <div className="p-2 rounded-large bg-primary-light text-primary">
              <FiFeather size={18} />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Materials & Textures</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed font-medium mb-4">
            For maximum cohesion, the AI suggests incorporating the following textures and palette:
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {materials.map((mat, idx) => (
              <span
                key={idx}
                className="bg-gray-50 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-large border border-gray-100 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                {mat}
              </span>
            ))}
          </div>

          {palette.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {palette.map((item, idx) => (
                <span key={idx} className="bg-gray-50 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-large border border-gray-100 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.hex || '#D9D9D9' }} />
                  {item.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Categories checklist */}
        <div>
          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2.5">
            Key Missing Categories
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <span className="text-primary">✓</span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 bg-gray-50 border border-gray-100 rounded-large p-4">
          <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
            <FiBarChart2 size={13} className="text-primary" /> Confidence Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-600">
            {Object.entries(confidenceBreakdown).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between bg-white border border-gray-100 rounded-large px-3 py-2">
                <span className="capitalize">{label}</span>
                <span className="text-primary">{value}%</span>
              </div>
            ))}
          </div>
          {(budgetOptions.length > 0 || premiumOptions.length > 0 || alternativeProducts.length > 0) && (
            <div className="mt-4 grid grid-cols-1 gap-3">
              {budgetOptions.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Budget Options</p>
                  <div className="flex flex-wrap gap-2">
                    {budgetOptions.slice(0, 2).map((item) => (
                      <span key={item.id} className="px-2.5 py-1 rounded-full bg-white border border-gray-100 text-[11px] font-semibold text-gray-600">
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {premiumOptions.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Premium Options</p>
                  <div className="flex flex-wrap gap-2">
                    {premiumOptions.slice(0, 2).map((item) => (
                      <span key={item.id} className="px-2.5 py-1 rounded-full bg-white border border-gray-100 text-[11px] font-semibold text-gray-600">
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {alternativeProducts.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Alternative Products</p>
                  <div className="flex flex-wrap gap-2">
                    {alternativeProducts.slice(0, 2).map((item) => (
                      <span key={item.id} className="px-2.5 py-1 rounded-full bg-white border border-gray-100 text-[11px] font-semibold text-gray-600">
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
