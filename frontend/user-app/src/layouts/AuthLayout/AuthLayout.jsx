import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white rounded-large shadow-premium border border-gray-100 p-8 md:p-10">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold text-primary tracking-wide font-sans">
            M<span className="text-secondary text-lg font-bold ml-0.5">AHAVEER</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-widest">Smart Furniture Hub</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
