import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Input, Button } from '../../../../shared/components/Common';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';

export default function AdminLogin() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    login(email, password, 'admin');
    toast.success('Welcome back, Administrator!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-12 relative overflow-hidden">
      <Toaster position="top-right" />
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-large shadow-2xl p-8 md:p-10 relative z-10"
      >
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-full mb-4">
            <FiShield className="text-primary" size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            M<span className="text-primary text-lg font-bold ml-0.5">AHAVEER</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Admin Control Panel</p>
        </div>

        <h2 className="text-lg font-bold text-white text-center mb-1">Welcome Back</h2>
        <p className="text-xs text-gray-500 text-center mb-6">Sign in to your administrator dashboard</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-1">
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@mahaveer.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <div className="flex justify-between items-center text-xs font-semibold mt-1 mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-gray-500">
              <input type="checkbox" className="accent-primary" /> Remember session
            </label>
            <Link to="/admin/forgot-password" className="text-primary hover:underline">Forgot Password?</Link>
          </div>

          <Button type="submit" className="w-full">Sign In</Button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-6 font-medium">
          Need admin access?{' '}
          <Link to="/admin/register" className="text-primary hover:underline font-bold">Request Registration</Link>
        </p>
      </motion.div>
    </div>
  );
}