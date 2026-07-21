import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUserPlus } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email.trim())) errs.email = 'Invalid email address';
    
    const cleanPhone = form.phone.trim().replace(/[-+ ]/g, '');
    if (!cleanPhone) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(cleanPhone)) errs.phone = 'Phone number must be exactly 10 digits';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanPhone = form.phone.trim().replace(/[-+ ]/g, '');

    try {
      setLoading(true);
      toast.loading('Registering admin user...', { id: 'admin-reg' });
      await axios.post(`${API_BASE}/api/auth/register`, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: cleanPhone,
        password: form.password,
        role: 'admin'
      });

      toast.success('Admin registration successful! You can now sign in.', { id: 'admin-reg' });
      navigate('/admin/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to register admin account.', { id: 'admin-reg' });
    } finally {
      setLoading(false);
    }
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-full mb-4">
            <FiUserPlus className="text-primary" size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            M<span className="text-primary text-lg font-bold ml-0.5">AHAVEER</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Admin Registration</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-1">
          <Input
            label="Full Name"
            placeholder="e.g. System Administrator"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Email"
            type="email"
            placeholder="admin@mahaveer.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. 9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={errors.phone}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
          />
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-6 font-medium">
          Already have access?{' '}
          <Link to="/admin/login" className="text-primary hover:underline font-bold">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
