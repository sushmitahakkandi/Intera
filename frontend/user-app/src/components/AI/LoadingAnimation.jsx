import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LoadingAnimation({ statusMessages = [], onComplete }) {
  const [currentMessageIdx, setCurrentMessageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress interval
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) onComplete();
          return 100;
        }
        return prev + 1;
      });
    }, 40); // 4 seconds total to 100%

    // Message change interval
    const messageInterval = setInterval(() => {
      setCurrentMessageIdx((prev) => {
        if (prev < statusMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [statusMessages, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-large shadow-premium max-w-md mx-auto text-center">
      {/* Radar scanning animation */}
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        <div className="absolute w-20 h-20 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/45 border-l-transparent animate-spin" />
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold shadow-sm">
          {progress}%
        </div>
      </div>

      {/* Progress Message */}
      <h3 className="text-sm font-bold text-gray-800 mb-1 transition-all duration-300">
        {statusMessages[currentMessageIdx] || "Analyzing room details..."}
      </h3>
      <p className="text-[11px] text-gray-400 font-semibold mb-4">Please wait while the AI model loads</p>

      {/* Custom Progress Bar */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-100/50">
        <motion.div
          className="bg-primary h-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
