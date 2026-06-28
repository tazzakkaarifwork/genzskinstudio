import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin-login" />;
  }

  return children;
};

export default AdminRoute;