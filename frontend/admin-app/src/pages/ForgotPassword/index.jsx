import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiKey } from 'react-icons/fi';

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Valid email is required');
      return;
    }
    setError('');
    toast.success('Recovery OTP sent to admin email!');
    navigate('/admin/reset-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-12 relative overflow-hidden">
      <Toaster position="top-right" />
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-large shadow-2xl p-8 md:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-full mb-4">
            <FiKey className="text-primary" size={28} />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Forgot Password</h2>
          <p className="text-xs text-gray-500 font-semibold">Enter your admin email to reset credentials</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <Input label="Admin Email" type="email" placeholder="admin@mahaveer.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" className="w-full mt-4">Send Recovery Link</Button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-6 font-medium">
          <Link to="/admin/login" className="text-primary hover:underline font-bold">Back to Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
