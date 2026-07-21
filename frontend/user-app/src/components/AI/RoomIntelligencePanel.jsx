import React from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiSun, FiLayers, FiFeather } from 'react-icons/fi';

const SCORE_LABELS = {
  colorHarmony: 'Color Harmony',
  textureBalance: 'Texture Balance',
  styleConsistency: 'Style Consistency',
  roomFit: 'Room Fit'
};

function ConfidenceRing({ value = 92 }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#F3EDE5" strokeWidth="7" />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#A66A2C"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-extrabold text-gray-800 leading-none">{value}%</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">AI Score</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold text-gray-600">{label}</span>
        <span className="text-[11px] font-extrabold text-primary">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
}

export default function RoomIntelligencePanel({
  interiorStyle,
  roomMood,
  lightingConditions,
  dominantTextures = [],
  confidenceScores = {},
  overallConfidence = 92,
  source
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-large p-6 shadow-premium">
      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-5">
        Room Intelligence
      </h4>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Confidence Ring */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <ConfidenceRing value={overallConfidence} />
          {source && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                source === 'gemini'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {source === 'gemini' ? '⚡ Gemini Vision' : '⚙ Fallback'}
            </span>
          )}
        </div>

        {/* Detection Badges */}
        <div className="flex-1 grid grid-cols-1 gap-3 w-full">
          {interiorStyle && (
            <div className="flex items-center gap-2 bg-secondary/5 border border-secondary/10 rounded-large px-3 py-2">
              <FiLayers className="text-secondary shrink-0" size={13} />
              <span className="text-[11px] font-bold text-gray-700">Style:</span>
              <span className="text-[11px] font-bold text-secondary">{interiorStyle}</span>
            </div>
          )}
          {roomMood && (
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-large px-3 py-2">
              <FiFeather className="text-primary shrink-0" size={13} />
              <span className="text-[11px] font-bold text-gray-700">Mood:</span>
              <span className="text-[11px] font-bold text-primary">{roomMood}</span>
            </div>
          )}
          {lightingConditions && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-large px-3 py-2">
              <FiSun className="text-yellow-500 shrink-0" size={13} />
              <span className="text-[11px] font-bold text-gray-700">Lighting:</span>
              <span className="text-[11px] font-bold text-yellow-700">{lightingConditions}</span>
            </div>
          )}
          {dominantTextures.length > 0 && (
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-large px-3 py-2">
              <FiZap className="text-gray-400 shrink-0 mt-0.5" size={13} />
              <div>
                <span className="text-[11px] font-bold text-gray-700 block mb-1">Textures:</span>
                <div className="flex flex-wrap gap-1">
                  {dominantTextures.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compatibility Score Bars */}
        {Object.keys(confidenceScores).length > 0 && (
          <div className="flex-1 flex flex-col gap-3 w-full min-w-[140px]">
            {Object.entries(confidenceScores).map(([key, value]) => (
              <ScoreBar key={key} label={SCORE_LABELS[key] || key} value={value} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
