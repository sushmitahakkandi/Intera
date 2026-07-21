import React from 'react';
import { FiCheck } from 'react-icons/fi';

export default function ColorPalette({ detectedColor, palette = [], woodFinishes = [], selectedTheme, onThemeSelect }) {
  const themes = ['Modern', 'Classic', 'Minimal', 'Industrial'];

  return (
    <div className="bg-white border border-gray-100 rounded-large p-6 shadow-premium">
      {/* Themes Selection */}
      {onThemeSelect && (
        <div className="mb-6">
          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
            Luxury Style Theme
          </h4>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => onThemeSelect(theme)}
                className={`text-xs font-bold py-2.5 px-4 rounded-large transition-all border ${
                  selectedTheme === theme
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wall & Match Palettes */}
        <div>
          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
            Detected Wall Color
          </h4>
          <div className="flex items-center gap-3 mb-6 bg-gray-50 border border-gray-100 p-3.5 rounded-large">
            <div
              style={{ backgroundColor: detectedColor.hex }}
              className="w-12 h-12 rounded-large border border-gray-200 shadow-sm"
            />
            <div>
              <p className="text-sm font-bold text-gray-800">{detectedColor.name}</p>
              <p className="text-xs font-medium text-gray-400">{detectedColor.hex}</p>
            </div>
          </div>

          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
            Suggested Color Palette
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {palette.map((color, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  style={{ backgroundColor: color.hex }}
                  className="w-full h-12 rounded-large border border-gray-100 shadow-sm relative group cursor-pointer"
                  title={color.name}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-large">
                    <span className="text-white text-[9px] font-bold">Copy</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-700 mt-1.5 truncate max-w-full">
                  {color.name}
                </span>
                <span className="text-[9px] font-semibold text-gray-400">{color.hex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wood Finish Suggestions */}
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
              Recommended Wood Finishes
            </h4>
            <div className="flex flex-col gap-2.5">
              {woodFinishes.map((finish, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-large hover:border-primary-light transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: finish.color }}
                      className="w-8 h-8 rounded-large border border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-800">{finish.name}</p>
                      <p className="text-[10px] font-medium text-gray-400">Match Level: High</p>
                    </div>
                  </div>
                  <FiCheck className="text-success" size={16} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
