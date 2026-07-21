import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Input, Button } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!form.name.trim()) tempErrors.name = 'Full name is required';
    if (!form.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = 'Invalid email address';
    }
    if (!form.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone.replace(/[-+ ]/g, ''))) {
      tempErrors.phone = 'Phone number must be 10 digits';
    }
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
        await register(form.name, form.email, form.password, form.phone);
        toast.success('Registration successful!');
        navigate('/');
      } catch (error) {
        toast.error(error.message || 'Registration failed');
      }
    } else {
      toast.error('Please fix the validation errors.');
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
      <h2 className="text-xl font-extrabold text-gray-800 text-center mb-1">Create Account</h2>
      <p className="text-xs text-gray-400 text-center mb-4">Register to experience smart shopping</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-1">
        <Input
          label="Full Name"
          placeholder="e.g. John Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. name@gmail.com"
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

        <Button type="submit" className="mt-4 w-full">
          Register
        </Button>
      </form>

      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-gray-250 w-full" />
        <span className="absolute bg-white px-3 text-xs text-gray-400 font-semibold uppercase">Or</span>
      </div>

      <button
        onClick={() => toast.success('Google registration simulation successful')}
        className="flex items-center justify-center gap-3 w-full border border-gray-300 hover:border-gray-400 bg-white py-2.5 rounded-large text-sm font-semibold text-gray-600 transition-colors shadow-sm"
      >
        <FcGoogle size={20} />
        Register with Google
      </button>

      <p className="text-xs text-center text-gray-500 mt-2 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-bold">
          Login
        </Link>
      </p>
    </motion.div>
  );
}