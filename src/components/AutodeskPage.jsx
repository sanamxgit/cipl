import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './Navigation';
import NotSureSection from './NotSureSection';
import Footer from './Footer';
import './AutodeskPage.css';
import QuotationModal from './QuotationModal';

const AutodeskPage = ({ previewData }) => {
  const [pageData, setPageData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (previewData) {
      setPageData(previewData);
      setLoading(false);
    } else {
      loadData();
    }
    setActiveCategory('all');
    loadProducts('all');
  }, [previewData]);

  const loadData = async () => {
    try {
      console.log('Loading Autodesk page data...');
      const pageResponse = await axios.get('/backend/api/autodesk-page.php');
      console.log('Page data response:', pageResponse.data);

      if (pageResponse.data.status === 'success' && pageResponse.data.data) {
        const data = pageResponse.data.data;
        console.log('Setting page data:', data);
        setPageData(data);
      } else {
        console.error('Invalid response:', pageResponse.data);
        setError('Invalid response format');
      }

      // Load categories and FAQs after page data is loaded
      const [categoriesResponse, faqsResponse] = await Promise.all([
        axios.get('/backend/api/autodesk-categories.php'),
        axios.get('/backend/api/autodesk-faqs.php')
      ]);

      if (categoriesResponse.data.status === 'success') {
        setCategories(categoriesResponse.data.data);
      }
      if (faqsResponse.data.status === 'success') {
        setFaqs(faqsResponse.data.data);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load page data');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (categoryId) => {
    try {
      let url = '/backend/api/autodesk-products.php';
      if (categoryId && categoryId !== 'all') {
        url += `?category=${categoryId}`;
      }
      const response = await axios.get(url);
      if (response.data.status === 'success') {
        setProducts(response.data.data);
      }
      setActiveCategory(categoryId);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
    }
  };

  useEffect(() => {
    loadProducts('all');
  }, []);

  const handleQuotationClick = (product) => {
    setSelectedProduct(product);
    setShowQuotation(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!pageData) {
    return <div className="error-message">No page data available</div>;
  }

  return (
    <div className="autodesk-page">
      <Navigation />
      
      <div className="hero-banner" style={{ height: '700px' }}>
        <div className="banner-content">
          <div className="banner-text">
            <h1>{pageData.banner_title || 'Autodesk AI helps you do more with less'}</h1>
            <p>{pageData.banner_subtitle || 'Our AI technology is available in Autodesk products to help you stay ahead of industry demands and technological shifts—boosting ambition, creativity, and sustainability.'}</p>
            <button 
              className="learn-more-btn"
              onClick={() => window.location.href = pageData.banner_button_link || '#'}
            >
              {pageData.banner_button_text || 'Learn more'}
            </button>
          </div>
        </div>
        <div className="banner-image">
          <img src={pageData.banner_image} alt="Autodesk AI" />
        </div>
      </div>

      <div className="category-nav">
        <div className="category-container">
          <button 
            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('all');
              loadProducts('all');
            }}
          >
            All Products
          </button>
          {categories.map(category => (
            <button 
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(category.id);
                loadProducts(category.id);
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <section className="products-section">
        <div className="container">
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image_url} alt={product.name} />
                </div>
                <div className="product-content">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-actions">
                    <button 
                      className="primary-btn"
                      onClick={() => handleQuotationClick(product)}
                    >
                      Plans & Pricing
                    </button>
                    <button className="secondary-btn">
                      Free Trial
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuotationModal 
        show={showQuotation}
        onHide={() => setShowQuotation(false)}
        selectedProduct={selectedProduct}
        productType="Autodesk"
      />

      <NotSureSection 
        title={pageData.quote_section_title}
        subtitle={pageData.quote_section_subtitle}
        buttonText={pageData.quote_button_text}
      />

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map(faq => (
              <div key={faq.id} className="faq-item">
                <div 
                  className="faq-question"
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                >
                  <h3>{faq.question}</h3>
                  <span className={`arrow ${activeFaq === faq.id ? 'active' : ''}`}>
                    ↓
                  </span>
                </div>
                <div className={`faq-answer ${activeFaq === faq.id ? 'active' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AutodeskPage; 