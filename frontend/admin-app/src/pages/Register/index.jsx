import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUserPlus } from 'react-icons/fi';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    toast.success('Admin registration request submitted!');
    navigate('/admin/login');
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
            <FiUserPlus className="text-primary" size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            M<span className="text-primary text-lg font-bold ml-0.5">AHAVEER</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Admin Registration</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-1">
          <Input label="Full Name" placeholder="Administrator Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Email" type="email" placeholder="admin@mahaveer.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
          <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={errors.confirmPassword} />
          <Button type="submit" className="w-full mt-4">Register</Button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-6 font-medium">
          Already have access?{' '}
          <Link to="/admin/login" className="text-primary hover:underline font-bold">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
