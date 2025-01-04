import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './Navigation';
import Footer from './Footer';
import './ProductView.css';

const ProductView = () => {
  const [product, setProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('home');
  const categories = ['For home', 'For business', 'For enterprise'];
  
  const slug = window.location.pathname.split('/products/')[1];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/backend/api/product-view.php?slug=${slug}`);
        if (response.data.status === 'success') {
          setProduct(response.data.product);
          // Set initial category based on URL hash or default to 'home'
          const hash = window.location.hash.replace('#', '');
          setSelectedCategory(hash || 'home');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    window.location.hash = category;
  };

  if (!product) return <div>Loading...</div>;

  return (
    <>
      <Navigation partnerLogo={product.partnerLogo} partnerName={product.partnerName} />
      <div className="product-view">
        {/* Hero Banner Section */}
        <div className="hero-banner" style={{ backgroundImage: `url(${product.bannerImage})` }}>
          <div className="container">
            <h1>{product.title}</h1>
            <div className="hero-description" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </div>

        {/* Category Selector */}
        <div className="category-selector">
          <div className="container">
            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.toLowerCase())}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container">
          <section className="product-content">
            <h2>{product.sections[selectedCategory]?.title}</h2>
            <div className="content-grid" dangerouslySetInnerHTML={{ 
              __html: product.sections[selectedCategory]?.content 
            }} />
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductView; 