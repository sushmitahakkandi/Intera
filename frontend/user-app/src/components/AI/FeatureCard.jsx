import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function FeatureCard({
  title,
  subtitle,
  description,
  icon: Icon,
  path,
  badge,
  bannerImage,
  accentColor = "from-amber-600 to-amber-800",
  highlights = [],
  buttonText = "Launch Tool"
}) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="bg-white rounded-large border border-gray-100 shadow-premium hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group relative"
    >
      {/* Top Banner Image / Visual Mockup */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900">
        <img
          src={bannerImage}
          alt={title}
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

        {/* Floating Top Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {badge}
          </span>
        </div>

        {/* Floating Icon Circle */}
        <div className="absolute bottom-4 left-6 z-10 w-12 h-12 rounded-large bg-white/10 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg group-hover:bg-primary group-hover:border-primary transition-all duration-300">
          <Icon size={24} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="mb-3">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-wide font-sans group-hover:text-primary transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs font-bold text-amber-800/80 uppercase tracking-wider mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-500 font-medium leading-relaxed mb-5">
            {description}
          </p>

          {/* Highlights List */}
          {highlights.length > 0 && (
            <div className="space-y-2 mb-6 border-t border-gray-100 pt-4">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-semibold">
                  <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <FiCheck size={10} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Launch Button */}
        <div className="pt-2">
          <Link
            to={path}
            className="w-full inline-flex items-center justify-center gap-2 bg-secondary group-hover:bg-primary text-white text-xs font-bold py-3.5 px-5 rounded-large transition-all duration-300 shadow-md group-hover:shadow-lg active:scale-98"
          >
            <span>{buttonText}</span>
            <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
