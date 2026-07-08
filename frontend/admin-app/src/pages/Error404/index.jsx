import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/components/Common';

export default function Error404() {
  return (
    <div className="max-w-md mx-auto text-center py-20 px-4">
      <h1 className="text-8xl font-black text-primary mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mb-3">Room Space Not Found</h2>
      <p className="text-xs text-gray-400 font-semibold mb-8">The page you are looking for has been rearranged or doesn't exist.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}