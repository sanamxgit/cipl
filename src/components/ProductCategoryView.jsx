import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import './ProductCategoryView.css';
import api from '../utils/api';
import './MicrosoftOffice.css';

const ProductCategoryView = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState({
    title: 'Get started with Microsoft Office 365 today',
    subtitle: 'Collaborate, create, and achieve more with the world\'s leading productivity suite.',
    banner_image: '',
    main_heading: 'Unlock productivity, creativity, and generative AI for your organization.',
    main_description: 'Microsoft 365 empowers your employees to do their best work with the power of generative AI in the apps they use daily.',
    plans: {
      home: {
        title: 'For Home',
        cards: []
      },
      business: {
        title: 'For Business',
        cards: []
      }
    }
  });
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showVideoLeftArrow, setShowVideoLeftArrow] = useState(false);
  const [showVideoRightArrow, setShowVideoRightArrow] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const { data } = await api.get('/microsoft-office.php');
        if (data.status === 'success') {
          setPageData(data.data);
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [category]);

  const renderProductCard = (card) => (
    <div className="product-card">
      <div className="product-card-header">
        <div>
          <p className="text-muted mb-1">{card.costText}</p>
          <h3 className="product-card-title">{card.title}</h3>
        </div>
        {card.tag && <span className="product-tag">{card.tag}</span>}
      </div>

      <div className="product-card-buttons mb-4">
        <button className="btn btn-primary">{card.primaryButton}</button>
        <button className="btn btn-outline-primary">{card.secondaryButton}</button>
      </div>

      {card.sections?.map((section, index) => (
        <div key={index} className="product-card-section">
          <h4 className="section-title">{section.title}</h4>
          <ul className="feature-list">
            {section.items?.map((item, itemIndex) => (
              <li key={itemIndex} className="feature-item">
                {section.icons?.[itemIndex] && (
                  <img src={section.icons[itemIndex]} alt="" className="feature-icon" />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const handleScroll = (direction) => {
    const container = document.querySelector('.ms-product-cards .row');
    if (container) {
      const scrollAmount = 400;
      const currentScroll = container.scrollLeft;
      container.scrollTo({
        left: currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        );
      }, 400);
    }
  };

  const handleVideoScroll = (direction) => {
    const container = document.querySelector('.ms-video-row');
    if (container) {
      const scrollAmount = 400;
      const currentScroll = container.scrollLeft;
      container.scrollTo({
        left: currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        setShowVideoLeftArrow(container.scrollLeft > 0);
        setShowVideoRightArrow(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        );
      }, 400);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navigation microsoftLogo={pageData.microsoftLogo} />
      <div className="microsoft-office-view">
        <div className="ms-hero-banner" style={{
          backgroundImage: pageData.banner_image ? `url(${pageData.banner_image})` : 'none'
        }}>
          <div className="ms-banner-overlay"></div>
          <div className="ms-banner-content">
            <h1>{pageData.title}</h1>
            <p className="subtitle">{pageData.subtitle}</p>
          </div>
          <div className="floating-icons">
            <div className="icon-container">
              <i className="fab fa-microsoft floating-icon icon1"></i>
              <i className="fas fa-file-word floating-icon icon2"></i>
              <i className="fas fa-file-excel floating-icon icon3"></i>
              <i className="fas fa-users floating-icon icon4"></i>
            </div>
          </div>
        </div>

        <div className="ms-category-selector">
          <div className="container">
            <div className="ms-category-buttons">
              <button
                className={`ms-category-btn ${selectedCategory === 'home' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('home')}
              >
                {pageData.plans.home?.title || 'For Home'}
              </button>
              <button
                className={`ms-category-btn ${selectedCategory === 'business' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('business')}
              >
                {pageData.plans.business?.title || 'For Business'}
              </button>
            </div>
          </div>
        </div>

        <div className="ms-product-cards">
          <div className="container position-relative">
            {showLeftArrow && (
              <div className="ms-scroll-arrow left" onClick={() => handleScroll('left')}>
                <i className="fas fa-chevron-left"></i>
              </div>
            )}
            <div className="row">
              {pageData.plans[selectedCategory]?.cards?.map((card, index) => (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className="ms-product-card">
                    <div className="ms-product-card-header">
                      <div>
                        <p className="text-muted mb-1">{card.costText}</p>
                        <h3 className="ms-product-card-title">{card.title}</h3>
                      </div>
                      {card.tag && <span className="ms-product-tag">{card.tag}</span>}
                    </div>

                    <div className="ms-product-card-buttons mb-4">
                      <button className="btn btn-primary">{card.primaryButton}</button>
                      <button className="btn btn-outline-primary">{card.secondaryButton}</button>
                    </div>

                    {card.sections?.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="ms-product-card-section">
                        <h4 className="ms-section-title">{section.title}</h4>
                        <ul className="ms-feature-list">
                          {section.items?.map((item, itemIndex) => (
                            <li key={itemIndex} className="ms-feature-item">
                              {section.icons?.[itemIndex] && (
                                <img src={section.icons[itemIndex]} alt="" className="ms-feature-icon" />
                              )}
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {showRightArrow && (
              <div className="ms-scroll-arrow right" onClick={() => handleScroll('right')}>
                <i className="fas fa-chevron-right"></i>
              </div>
            )}
          </div>
        </div>

        <div className="ms-video-section">
          <div className="container">
            <h2 className="text-center mb-4">Featured Videos</h2>
            <div className="ms-video-container">
              {showVideoLeftArrow && (
                <div className="ms-video-arrow left" onClick={() => handleVideoScroll('left')}>
                  <i className="fas fa-chevron-left"></i>
                </div>
              )}
              <div className="ms-video-row">
                {pageData.videos?.map((video, index) => (
                  <div key={index} className="ms-video-card">
                    <img src={video.thumbnail} alt={video.title} className="ms-video-thumbnail" />
                    <div className="ms-video-content">
                      <h3 className="ms-video-title">{video.title}</h3>
                      <p className="ms-video-description">{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {showVideoRightArrow && (
                <div className="ms-video-arrow right" onClick={() => handleVideoScroll('right')}>
                  <i className="fas fa-chevron-right"></i>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ms-partner-logos">
          <div className="container">
            <div className="d-flex align-items-center justify-content-center">
              <img src={pageData.microsoftLogo} alt="Microsoft" className="partner-logo" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductCategoryView; 