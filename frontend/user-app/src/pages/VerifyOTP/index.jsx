import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('OTP code is required');
      return;
    } else if (otp.trim().length !== 6) {
      setError('OTP must be exactly 6 digits');
      return;
    }
    setError('');
    toast.success('OTP verified successfully!');
    navigate('/reset-password');
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
      <p className="text-xs text-gray-400 text-center mb-4">Enter the 6-digit code sent to your inbox</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Input
          label="One-Time Password (OTP)"
          placeholder="e.g. 123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          error={error}
          maxLength={6}
        />
        <Button type="submit" className="mt-4 w-full">Verify</Button>
      </form>
    </motion.div>
  );
}