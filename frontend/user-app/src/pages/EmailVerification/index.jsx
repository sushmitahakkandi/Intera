import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiShield, FiRefreshCw } from 'react-icons/fi';

export default function EmailVerification() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-6">
          <FiMail size={36} className="text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Verify Your Email</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        <div className="bg-white border border-gray-100 rounded-large shadow-premium p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <FiShield className="text-success" size={20} />
            <span className="text-sm font-semibold text-gray-700">Check your inbox</span>
          </div>
          <p className="text-xs text-gray-500">Look for an email from <strong>support@mahaveer.com</strong>. If you don't see it, check your spam folder.</p>
        </div>
        <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <FiRefreshCw size={14} /> Resend Verification Email
        </button>
        <div className="mt-6">
          <Link to="/login" className="text-xs text-gray-400 hover:text-primary transition-colors font-medium">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
