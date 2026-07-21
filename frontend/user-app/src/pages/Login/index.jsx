import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Input, Button } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const loggedUser = await login(email, password);
      toast.success('Logged in successfully!');
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h2 className="text-xl font-extrabold text-gray-800 text-center mb-1">Welcome Back</h2>
      <p className="text-xs text-gray-400 text-center mb-4">Please log in to your account</p>

      <Input
        label="Email Address"
        type="email"
        placeholder="e.g. customer@gmail.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
        error={errors.password}
      />

      <div className="flex justify-between items-center text-xs font-semibold mt-1">
        <label className="flex items-center gap-2 cursor-pointer text-gray-500">
          <input type="checkbox" className="accent-primary" /> Remember Me
        </label>
        <Link to="/forgot-password" className="text-primary hover:underline">Forgot Password?</Link>
      </div>

      <Button type="submit" className="mt-4">Login</Button>
      
      <p className="text-xs text-center text-gray-500 mt-2 font-medium">
        Don't have an account? <Link to="/register" className="text-primary hover:underline font-bold">Register Now</Link>
      </p>
    </form>
  );
}