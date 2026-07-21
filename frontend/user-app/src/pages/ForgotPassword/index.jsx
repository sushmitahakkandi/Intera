import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/[-+ ]/g, '');
    if (!cleanPhone) {
      setError('Phone number is required');
      return;
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    setError('');

    try {
      setLoading(true);
      toast.loading('Generating verification OTP...', { id: 'send-otp' });
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password-phone`, { phone: cleanPhone });
      
      const targetPhone = res.data.phone || cleanPhone;
      const otpCode = res.data.otp;

      toast.success(
        `OTP for ${targetPhone}: ${otpCode}\n(Note: Add FAST2SMS_API_KEY to backend/.env for real mobile SMS)`, 
        { id: 'send-otp', duration: 12000 }
      );

      localStorage.setItem('recovery_phone', targetPhone);
      navigate('/verify-otp');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to send OTP to registered phone number.', { id: 'send-otp' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <h2 className="text-xl font-extrabold text-gray-800 text-center mb-1">Forgot Password</h2>
      <p className="text-xs text-gray-400 text-center mb-4">Enter your phone number to receive a verification OTP</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="e.g. 9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={error}
        />
        <Button type="submit" className="mt-4 w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send OTP'}
        </Button>
      </form>

      <p className="text-xs text-center text-gray-500 mt-2">
        <Link to="/login" className="text-primary hover:underline font-bold">Back to Login</Link>
      </p>
    </motion.div>
  );
}