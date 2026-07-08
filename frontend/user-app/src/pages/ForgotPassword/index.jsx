import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address');
      return;
    }
    setError('');
    toast.success('OTP sent to your email address!');
    navigate('/verify-otp');
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
      <p className="text-xs text-gray-400 text-center mb-4">We will send you an OTP to recover your password</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. name@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <Button type="submit" className="mt-4 w-full">Send OTP</Button>
      </form>

      <p className="text-xs text-center text-gray-500 mt-2">
        <Link to="/login" className="text-primary hover:underline font-bold">Back to Login</Link>
      </p>
    </motion.div>
  );
}