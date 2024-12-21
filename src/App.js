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
import VideoSection from './components/VideoSection';
import VideoManager from './admin/pages/VideoManager';
import FeaturedManager from './admin/pages/FeaturedManager';
import FeaturedProducts from './components/FeaturedProducts';

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
            <div className="container" style={{ marginTop: '160px' }}>
              <h2 className="text-center mb-4" style={{ 
                fontSize: '2.2rem',
                fontWeight: '600',
                color: '#333'
              }}>
                Our Products
              </h2>
              <BrandScroller />
            </div>
            <VideoSection />
            <div style={{ marginBottom: '40px' }}></div>
            <FeaturedProducts />
          </>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<AdminHome />} />
                <Route path="carousels" element={<AdminHome />} />
                <Route path="brands" element={<BrandsManager />} />
                <Route path="products" element={<ProductsManager />} />
                <Route path="video" element={<VideoManager />} />
                <Route path="featured" element={<FeaturedManager />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
