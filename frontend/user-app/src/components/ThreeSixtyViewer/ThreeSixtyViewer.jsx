import React, { useState, useRef, useEffect } from 'react';
import { FiRotateCw, FiMove } from 'react-icons/fi';

export default function ThreeSixtyViewer({ images = [], fallbackImage = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentIndexRef = useRef(0);

  // Filter 360 images if any, or use general images
  const rotationImages = images.length > 0 ? images : [fallbackImage].filter(Boolean);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handleMouseDown = (e) => {
    if (rotationImages.length <= 1) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || rotationImages.length <= 1) return;
    
    const deltaX = e.clientX - startXRef.current;
    
    // Sensitivity: how many pixels of drag trigger 1 frame change
    const sensitivity = 15;
    const steps = Math.floor(deltaX / sensitivity);
    
    if (steps !== 0) {
      let newIndex = (currentIndexRef.current - steps) % rotationImages.length;
      if (newIndex < 0) {
        newIndex = rotationImages.length + newIndex;
      }
      
      setCurrentIndex(newIndex);
      startXRef.current = e.clientX; // Reset anchor to avoid jumpy scrolling
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Events for Mobile support
  const handleTouchStart = (e) => {
    if (rotationImages.length <= 1) return;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || rotationImages.length <= 1) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    const sensitivity = 12;
    const steps = Math.floor(deltaX / sensitivity);

    if (steps !== 0) {
      let newIndex = (currentIndexRef.current - steps) % rotationImages.length;
      if (newIndex < 0) {
        newIndex = rotationImages.length + newIndex;
      }
      setCurrentIndex(newIndex);
      startXRef.current = e.touches[0].clientX;
    }
  };

  // Attach global mouseup listener to stop drag outside component bounds
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div 
      className="relative w-full aspect-[4/3] rounded-large overflow-hidden border border-gray-150 bg-white select-none shadow-sm cursor-ew-resize"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {rotationImages.length > 0 ? (
        <div className="w-full h-full flex items-center justify-center relative p-4">
          <img 
            src={rotationImages[currentIndex]} 
            alt={`360-view-${currentIndex}`} 
            className="max-w-full max-h-full object-contain pointer-events-none transition-all duration-75"
          />
          
          {/* HUD overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-secondary/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase shadow-md">
            <FiRotateCw size={12} className="animate-spin-slow text-primary" />
            <span>Drag horizontally to rotate 360°</span>
          </div>

          <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full border border-gray-100 shadow-sm">
            <FiMove size={16} className="text-gray-550" />
          </div>

          <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
            Interactive 360°
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8">
          <FiRotateCw size={36} className="mb-2 text-gray-300 animate-spin-slow" />
          <span className="text-xs font-bold text-gray-650">360° Interactive Turntable View</span>
          <span className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Upload 360 view frames to enable interactive rotation</span>
        </div>
      )}
    </div>
  );
}
