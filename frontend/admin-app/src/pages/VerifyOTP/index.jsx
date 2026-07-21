import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminVerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const savedPhone = localStorage.getItem('admin_recovery_phone');
    if (!savedPhone) {
      toast.error('No pending recovery request. Please enter your phone number first.');
      navigate('/admin/forgot-password');
    } else {
      setPhone(savedPhone);
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError('OTP code is required');
      return;
    } else if (cleanOtp.length !== 6) {
      setError('OTP must be exactly 6 digits');
      return;
    }
    setError('');

    try {
      setLoading(true);
      toast.loading('Verifying OTP...', { id: 'verify-admin-otp' });
      await axios.post(`${API_BASE}/api/auth/verify-otp-phone`, { phone, otp: cleanOtp });

      toast.success('OTP verified successfully!', { id: 'verify-admin-otp' });
      localStorage.setItem('admin_recovery_otp', cleanOtp);
      navigate('/admin/reset-password');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Invalid OTP code.', { id: 'verify-admin-otp' });
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
            <FiCheckCircle className="text-primary" size={28} />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Verify OTP Code</h2>
          <p className="text-xs text-gray-400 font-semibold">
            Enter the 6-digit verification code sent to registered phone number: <span className="text-primary font-bold">{phone}</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <Input
            label="One-Time Password (OTP)"
            placeholder="e.g. 123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={error}
            maxLength={6}
          />
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6 font-medium">
          <Link to="/admin/forgot-password" className="text-primary hover:underline font-bold">Resend OTP / Change Phone</Link>
        </p>
      </motion.div>
    </div>
  );
}
