import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HeroCarousel from './components/HeroCarousel';
import AdminLayout from './admin/components/AdminLayout';
import AdminHome from './admin/pages/AdminHome';
import BrandsManager from './admin/pages/BrandsManager';
import ProductsManager from './admin/pages/ProductsManager';
import { isAuthenticated } from './utils/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/hero-carousel.css';
import './styles/navigation.css';
import BrandScroller from './components/BrandScroller';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Navigation />
            <HeroCarousel />
            <div className="container mt-5">
              <h2 className="text-center mb-5">Our Products</h2>
              <BrandScroller />
            </div>
          </>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<AdminHome />} />
                <Route path="brands" element={<BrandsManager />} />
                <Route path="products" element={<ProductsManager />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
