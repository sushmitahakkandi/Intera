import React from 'react';

export default function AIAvatar({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  };

  return (
    <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-tr from-primary to-amber-600 font-extrabold text-white shadow-md ${sizes[size]}`}>
      {/* Outer Pulse rings for futuristic look */}
      <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-60 scale-105" />
      <span className="font-sans tracking-wide">AI</span>
    </div>
  );
}
