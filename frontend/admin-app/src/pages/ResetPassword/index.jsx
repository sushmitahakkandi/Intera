import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const savedPhone = localStorage.getItem('admin_recovery_phone');
    const savedOtp = localStorage.getItem('admin_recovery_otp');
    if (!savedPhone || !savedOtp) {
      toast.error('Session expired or missing. Please initiate password recovery again.');
      navigate('/admin/forgot-password');
    } else {
      setPhone(savedPhone);
      setOtp(savedOtp);
    }
  }, [navigate]);

  const validate = () => {
    const errs = {};
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      toast.loading('Resetting password...', { id: 'reset-admin-pwd' });

      await axios.post(`${API_BASE}/api/auth/reset-password-phone`, {
        phone,
        otp,
        newPassword: form.password
      });

      toast.success('Admin password reset successfully! Please log in with your new password.', { id: 'reset-admin-pwd' });
      localStorage.removeItem('admin_recovery_phone');
      localStorage.removeItem('admin_recovery_otp');
      localStorage.removeItem('admin_demo_otp');
      navigate('/admin/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to reset password.', { id: 'reset-admin-pwd' });
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-full mb-4">
            <FiLock className="text-primary" size={28} />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Reset Admin Password</h2>
          <p className="text-xs text-gray-400 font-semibold">Set a new strong password for account: <span className="text-primary font-bold">{phone}</span></p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-1">
          <Input
            label="New Password"
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
            {loading ? 'Saving...' : 'Save New Password'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
