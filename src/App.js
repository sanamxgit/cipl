import React, { useState, useEffect } from 'react';
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
import { FeaturedProvider } from './context/FeaturedContext';
import ImageGrid from './components/ImageGrid';
import ImageGridManager from './admin/pages/ImageGridManager';
import axios from 'axios';
import TrustedLeaders from './components/TrustedLeaders';
import TrustedLeadersManager from './admin/pages/TrustedLeadersManager';
import FAQSection from './components/FAQSection';
import FAQManager from './admin/pages/FAQManager';
import Footer from './components/Footer';
import NotSureSection from './components/NotSureSection';
import FooterManager from './admin/pages/FooterManager';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [gridImages, setGridImages] = useState([]);

  useEffect(() => {
    const fetchGridImages = async () => {
      try {
        const response = await axios.get('/backend/api/image-grid.php');
        if (response.data.status === 'success') {
          setGridImages(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching grid images:', error);
      }
    };

    fetchGridImages();
  }, []);

  return (
    <Router>
      <FeaturedProvider>
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
              <div style={{ marginBottom: '20px' }}></div>
              <FeaturedProducts />
              <ImageGrid images={gridImages} />
              <TrustedLeaders />
              <FAQSection />
              <NotSureSection />
              <Footer />
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
                  <Route path="image-grid" element={<ImageGridManager />} />
                  <Route path="trusted-leaders" element={<TrustedLeadersManager />} />
                  <Route path="faqs" element={<FAQManager />} />
                  <Route path="footer" element={<FooterManager />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </FeaturedProvider>
    </Router>
  );
}

export default App;
