import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import MicrosoftVideoSection from './MicrosoftVideoSection';
import MicrosoftProducts from './MicrosoftProducts';
import MicrosoftFeatures from './MicrosoftFeatures';
import QuotationModal from './QuotationModal';
import './MicrosoftOffice.css';

const MicrosoftOffice = () => {
  const [pageData, setPageData] = useState(null);
  const [products, setProducts] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('business');
  const [showQuotation, setShowQuotation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pageResponse, productsResponse, featuresResponse] = await Promise.all([
          api.get('/microsoft-office.php'),
          api.get('/microsoft-products.php'),
          api.get('/microsoft-features.php')
        ]);

        if (pageResponse.data.status === 'success') {
          setPageData(pageResponse.data.data);
        }

        if (productsResponse.data.status === 'success') {
          setProducts(productsResponse.data.data || []);
        }

        if (featuresResponse.data.status === 'success') {
          setFeatures(featuresResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error loading Microsoft Office data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeCategory]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handleQuotationClick = (product) => {
    setSelectedProduct(product);
    setShowQuotation(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="microsoft-office-page">
      {/* Video Section */}
      <MicrosoftVideoSection 
        videoData={{
          video_url: pageData?.video_url,
          video_title: pageData?.video_title,
          video_description: pageData?.video_description
        }} 
      />

      {/* Category Tabs */}
      <div className="category-tabs">
        <button 
          className={`tab-button ${activeCategory === 'business' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('business')}
        >
          For Business
        </button>
        <button 
          className={`tab-button ${activeCategory === 'personal' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('personal')}
        >
          For Personal
        </button>
      </div>

      {/* Features Section */}
      <div className="ms-features-wrapper">
        <MicrosoftFeatures features={features} />
      </div>

      {/* Microsoft Products Section */}
      <MicrosoftProducts 
        products={products} 
        onQuotationClick={handleQuotationClick}
      />

      <QuotationModal 
        show={showQuotation}
        onHide={() => setShowQuotation(false)}
        selectedProduct={selectedProduct}
        productType="Microsoft"
      />
    </div>
  );
};

export default MicrosoftOffice; 