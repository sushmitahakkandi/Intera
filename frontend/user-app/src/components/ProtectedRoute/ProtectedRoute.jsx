import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

// Simple Route Guard to protect customer and admin views
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, token } = useApp();

  if (!user || !token) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to home if user has insufficient roles
    return <Navigate to="/" replace />;
  }

  // Render child routes
  return <Outlet />;
}
