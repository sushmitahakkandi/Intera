import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const savedPhone = localStorage.getItem('recovery_phone');
    const savedOtp = localStorage.getItem('recovery_otp');
    if (!savedPhone || !savedOtp) {
      toast.error('Session expired or missing. Please try again.');
      navigate('/forgot-password');
    } else {
      setPhone(savedPhone);
      setOtp(savedOtp);
    }
  }, [navigate]);

  const validate = () => {
    let tempErrors = {};
    if (!form.password) {
      tempErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        setLoading(true);
        toast.loading('Resetting password...', { id: 'reset-pwd' });
        await axios.post(`${API_BASE}/api/auth/reset-password-phone`, {
          phone,
          otp,
          newPassword: form.password
        });
        toast.success('Password reset successfully!', { id: 'reset-pwd' });
        localStorage.removeItem('recovery_phone');
        localStorage.removeItem('recovery_otp');
        navigate('/login');
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || 'Failed to reset password.', { id: 'reset-pwd' });
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Please fix validation errors.');
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
      <h2 className="text-xl font-extrabold text-gray-800 text-center mb-1">Reset Password</h2>
      <p className="text-xs text-gray-400 text-center mb-4">Enter a strong new password</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
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
        <Button type="submit" className="mt-4 w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Password'}
        </Button>
      </form>
    </motion.div>
  );
}