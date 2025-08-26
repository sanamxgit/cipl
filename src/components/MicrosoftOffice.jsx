import React, { useState, useEffect, useRef } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import MicrosoftFAQSection from './MicrosoftFAQSection';
import ContactModal from './ContactModal';
import useContactModal from '../hooks/useContactModal';
import api from '../utils/api';
import './MicrosoftOffice.css';

const MicrosoftOffice = () => {
  const { showContactModal, openContactModal, closeContactModal } = useContactModal();
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState({
    title: 'Get started with Microsoft Office 365 today',
    subtitle: 'Collaborate, create, and achieve more with the world\'s leading productivity suite.',
    banner_image: '',
    main_heading: 'Unlock productivity, creativity, and generative AI for your organization.',
    main_description: 'Microsoft 365 empowers your employees to do their best work with the power of generative AI in the apps they use daily.',
    plans: {
      business: { title: 'For Business', cards: [] },
      home: { title: 'For Home', cards: [] }
    },
    videos: [],
    microsoftLogo: ''
  });
  const [videoData, setVideoData] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [videoVisible, setVideoVisible] = useState(false);
  const sectionRef = useRef(null);

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

    const fetchVideoData = async () => {
      try {
        const { data } = await api.get('/microsoft-video-section.php');
        if (data.status === 'success' && data.data) {
          setVideoData(data.data);
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
      }
    };

    fetchPageData();
    fetchVideoData();
  }, []);



  const handleScroll = (direction) => {
    const container = document.querySelector('.ms-product-cards .row');
    if (!container) return;
    const scrollAmount = 400;
    const currentScroll = container.scrollLeft;
    container.scrollTo({
      left: currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount),
      behavior: 'smooth'
    });
    setTimeout(() => {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }, 400);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );
    
    // Add a small delay to ensure the ref is available
    setTimeout(() => {
      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
    }, 100);
    
    return () => {
      observer.disconnect();
    };
  }, [videoData]); // Add videoData as dependency to re-run when video data is loaded

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
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={openContactModal}
                      >
                        {card.secondaryButton}
                      </button>
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

        <div className={`ms-video-section ${videoVisible ? 'visible' : ''}`} ref={sectionRef}>
          <div className="container">
            <div className="ms-video-content">
              <h2>{videoData?.title || 'Featured Video'}</h2>
              <p>{videoData?.description || 'Discover Microsoft 365 in action.'}</p>
            </div>
            {console.log('Video data:', videoData)}
            {console.log('Video visible:', videoVisible)}
            {videoData?.video_url && videoData.video_url.includes('player.cloudinary.com') && (
              console.log('Cloudinary URL with autoplay:', `${videoData.video_url}${videoVisible ? '&autoplay=1&muted=1&loop=1' : ''}`)
            )}
            {videoData?.video_url ? (
              <div className="ms-video-wrapper">
                {videoData.video_url.includes('player.cloudinary.com') ? (
                  // Use iframe for Cloudinary player embed URLs
                  <iframe
                    className="ms-video-player"
                    src={`${videoData.video_url}${videoVisible ? '&autoplay=1&muted=1&loop=1' : ''}`}
                    title={videoData.title || 'Microsoft Video'}
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    style={{ aspectRatio: '16/9' }}
                    onLoad={() => {
                      console.log('Cloudinary iframe loaded, videoVisible:', videoVisible);
                      console.log('Final URL:', `${videoData.video_url}${videoVisible ? '&autoplay=1&muted=1&loop=1' : ''}`);
                    }}
                  ></iframe>
                ) : (
                  // Use video tag for direct video files
                  <video
                    className="ms-video-player"
                    muted
                    loop
                    playsInline
                    autoPlay={videoVisible}
                    controls
                    onLoadStart={() => console.log('Video loading started')}
                    onCanPlay={() => console.log('Video can play')}
                    onError={(e) => console.log('Video error:', e)}
                  >
                    <source src={videoData.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              <div className="ms-video-wrapper" style={{ 
                background: '#333', 
                color: '#fff', 
                padding: '2rem', 
                textAlign: 'center',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <p>No video URL found in videoData</p>
              </div>
            )}
            {!videoData?.video_url && (
              <div className="ms-video-wrapper">
                <div style={{ 
                  background: '#333', 
                  color: '#fff', 
                  padding: '2rem', 
                  textAlign: 'center',
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <p>No video data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="ms-partner-logos">
          <div className="container">
            <div className="d-flex align-items-center justify-content-center">
              {pageData.microsoftLogo ? (
                <img src={pageData.microsoftLogo} alt="Microsoft" className="partner-logo" />
              ) : null}
            </div>
          </div>
        </div>
        <MicrosoftFAQSection />
      </div>
      <ContactModal 
        show={showContactModal} 
        onHide={closeContactModal}
      />
      <Footer />
    </>
  );
};

export default MicrosoftOffice;
