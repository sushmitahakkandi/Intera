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

  const onSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      const is_admin = email.includes('admin');
      login(email, password, is_admin ? 'admin' : 'customer');
      toast.success('Logged in successfully!');
      if (is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold text-gray-800 text-center mb-1">Welcome Back</h2>
      <p className="text-xs text-gray-400 text-center mb-4">Please log in to your account</p>

      <Input label="Email Address" type="email" placeholder="e.g. customer@gmail.com (or admin@gmail.com)" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

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