import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import AdminLayout from './admin/components/AdminLayout';
import AutodeskPage from './components/AutodeskPage';
import AutodeskManager from './admin/pages/AutodeskManager';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import AccountSettings from './components/AccountSettings';
import AdminLogin from './admin/components/AdminLogin';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigation />} />
        <Route path="/products/autodesk" element={
          <>
            <Navigation />
            <AutodeskPage />
          </>
        } />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<div>Welcome to Admin</div>} />
          <Route path="autodesk" element={<AutodeskManager />} />
        </Route>

        {/* Account Settings Route */}
        <Route path="/account" element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App; 