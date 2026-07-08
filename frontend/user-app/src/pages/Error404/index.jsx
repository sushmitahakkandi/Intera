import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/components/Common';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';

export default function Error404() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center"
      >
        <h1 className="text-9xl font-black text-primary/10 tracking-widest selection:bg-transparent">
          404
        </h1>
        <h2 className="text-2xl font-extrabold text-gray-800 mt-4 mb-2">Room Space Not Found</h2>
        <p className="text-xs text-gray-400 font-semibold mb-8 max-w-xs mx-auto leading-relaxed">
          The page you are looking for has been rearranged or doesn't exist. Let's get you back on track.
        </p>
        <Link to="/" className="inline-block">
          <Button className="flex items-center gap-2">
            <FiHome /> Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}