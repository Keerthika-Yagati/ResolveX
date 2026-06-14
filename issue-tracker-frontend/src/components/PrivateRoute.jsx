import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, user, requiredRole }) {
  const token = localStorage.getItem('token');
  
  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default PrivateRoute;