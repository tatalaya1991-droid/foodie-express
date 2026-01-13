import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireRole({ roles = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role || 'customer';
  if (!roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}
