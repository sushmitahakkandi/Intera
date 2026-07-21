import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiKey } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const cleanVal = phone.trim();
    if (!cleanVal) {
      setError('Registered phone number or email is required');
      return;
    }
    setError('');

    try {
      setLoading(true);
      toast.loading('Sending verification OTP...', { id: 'admin-otp' });

      const response = await axios.post(`${API_BASE}/api/auth/forgot-password-phone`, { phone: cleanVal });

      const targetPhone = response.data.phone || cleanVal;
      const otpCode = response.data.otp;

      toast.success(
        `OTP for Admin (${targetPhone}): ${otpCode}\n(Note: Add FAST2SMS_API_KEY to backend/.env for real mobile SMS)`, 
        { id: 'admin-otp', duration: 12000 }
      );

      localStorage.setItem('admin_recovery_phone', targetPhone);
      navigate('/admin/verify-otp');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to send OTP to registered phone number.', { id: 'admin-otp' });
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
            <FiKey className="text-primary" size={28} />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Admin Forgot Password</h2>
          <p className="text-xs text-gray-400 font-semibold">Enter your registered phone number or admin email to receive a 6-digit OTP</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <Input
            label="Registered Phone Number or Email"
            type="text"
            placeholder="e.g. 9876543210 or admin@mahaveer.com"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={error}
          />
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send Verification OTP'}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6 font-medium">
          <Link to="/admin/login" className="text-primary hover:underline font-bold">Back to Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
