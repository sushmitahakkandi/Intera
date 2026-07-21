import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const savedPhone = localStorage.getItem('recovery_phone');
    if (!savedPhone) {
      toast.error('No pending recovery request. Please enter your phone number first.');
      navigate('/forgot-password');
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
      toast.loading('Verifying OTP...', { id: 'verify-otp' });
      await axios.post(`${API_BASE}/api/auth/verify-otp-phone`, { phone, otp: cleanOtp });
      toast.success('OTP verified successfully!', { id: 'verify-otp' });
      localStorage.setItem('recovery_otp', cleanOtp);
      navigate('/reset-password');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Invalid OTP code.', { id: 'verify-otp' });
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
      <h2 className="text-xl font-extrabold text-gray-800 text-center mb-1">Verify OTP</h2>
      <p className="text-xs text-gray-400 text-center mb-4">Enter the 6-digit code sent to your phone number {phone}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Input
          label="One-Time Password (OTP)"
          placeholder="e.g. 123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          error={error}
          maxLength={6}
        />
        <Button type="submit" className="mt-4 w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </motion.div>
  );
}