import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { user, userType } = useSelector((state) => state.auth);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (userType !== 'patsanstha') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;