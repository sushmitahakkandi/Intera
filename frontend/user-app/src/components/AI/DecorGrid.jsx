import React from 'react';
import { FiDroplet, FiWind, FiSquare, FiImage, FiFeather, FiSun } from 'react-icons/fi';

const DECOR_CATEGORIES = [
  { key: 'upholsteryMaterials', label: 'Upholstery', icon: FiSquare, color: 'bg-amber-50 border-amber-100 text-amber-700' },
  { key: 'curtainColors', label: 'Curtains', icon: FiWind, color: 'bg-blue-50 border-blue-100 text-blue-700' },
  { key: 'rugs', label: 'Rugs', icon: FiSquare, color: 'bg-orange-50 border-orange-100 text-orange-700' },
  { key: 'wallDecor', label: 'Wall Décor', icon: FiImage, color: 'bg-purple-50 border-purple-100 text-purple-700' },
  { key: 'indoorPlants', label: 'Indoor Plants', icon: FiFeather, color: 'bg-green-50 border-green-100 text-green-700' },
  { key: 'lighting', label: 'Lighting', icon: FiSun, color: 'bg-yellow-50 border-yellow-100 text-yellow-700' }
];

export default function DecorGrid({ decorRecommendations = {}, colorsToAvoid = [] }) {
  const hasDecor = DECOR_CATEGORIES.some(
    (cat) => (decorRecommendations[cat.key] || []).length > 0
  );

  if (!hasDecor && !colorsToAvoid.length) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-large p-6 shadow-premium">
      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-5">
        Décor &amp; Material Recommendations
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DECOR_CATEGORIES.map(({ key, label, icon: Icon, color }) => {
          const items = decorRecommendations[key] || [];
          if (!items.length) return null;
          return (
            <div key={key} className={`border rounded-large p-4 ${color.split(' ').slice(0, 2).join(' ')}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <Icon size={13} className={color.split(' ')[2]} />
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${color.split(' ')[2]}`}>
                  {label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-1 bg-white/70 border border-current/20 rounded-full text-gray-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Colors to Avoid */}
      {colorsToAvoid.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <FiDroplet className="text-red-400" size={13} />
            <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider">
              Colors to Avoid
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colorsToAvoid.map((color, i) => (
              <span
                key={i}
                className="text-[10px] font-bold px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-red-600"
              >
                ✕ {color}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
