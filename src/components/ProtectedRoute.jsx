import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Login from './Login';
import api from '../utils/api';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [location]);

  const checkAuth = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        setIsAuthenticated(false);
        setShowLogin(true);
        setIsChecking(false);
        return;
      }

      const { data } = await api.post('/verify-auth.php', { user: JSON.parse(user) });
      
      if (data.status === 'success' && data.user.role === 'admin') {
        setIsAuthenticated(true);
        setShowLogin(false);
      } else {
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setShowLogin(true);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setShowLogin(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogin = (userData) => {
    if (userData.role === 'admin') {
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setShowLogin(false);
    }
  };

  if (isChecking) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute; 