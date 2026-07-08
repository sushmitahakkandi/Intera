import React from 'react';
import { FiCamera, FiChevronRight, FiLayers } from 'react-icons/fi';

export default function AIRoomVisualizer() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-12 bg-primary-light">
      <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-6 shadow-premium">
        <FiCamera size={36} className="text-white" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-800 mb-3">AI Room Visualizer (Coming Soon)</h1>
      <p className="text-gray-600 max-w-xl mb-8">
        Upload a photo of your room and let our AI generate realistic furniture placement suggestions.
        <br />
        <span className="text-sm text-primary font-medium">Future integration: TensorFlow.js + Three.js</span>
      </p>
      <button className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-large hover:bg-primary-hover transition-all">
        <FiLayers size={16} /> Learn More {" "}<FiChevronRight size={14} />
      </button>
    </div>
  );
}