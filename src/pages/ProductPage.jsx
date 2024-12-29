import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ProductPage.css';

const ProductPage = () => {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await axios.get(`/backend/api/product-pages.php?slug=${slug}`);
        if (response.data.status === 'success') {
          setPageData(response.data.data);
          if (response.data.data.sections?.length > 0) {
            setSelectedTab(response.data.data.sections[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!pageData) {
    return <div>Page not found</div>;
  }

  const heroSection = pageData.sections.find(section => section.section_type === 'hero');
  const tabsSection = pageData.sections.find(section => section.section_type === 'tabs');

  return (
    <div className="product-page">
      {/* Hero Section */}
      <section 
        className="hero-section"
        style={{ backgroundColor: pageData.background_color }}
      >
        <div className="container">
          <div className="hero-content">
            <h1>{pageData.title}</h1>
            <p>{pageData.subtitle}</p>
            <div className="tab-buttons">
              {tabsSection?.content.tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-button ${selectedTab === tab.id ? 'active' : ''}`}
                  onClick={() => setSelectedTab(tab.id)}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>
          <div className="hero-image">
            <img src={pageData.hero_image_url} alt={pageData.title} />
          </div>
        </div>
      </section>

      {/* Tab Content Section */}
      {tabsSection && (
        <section className="tab-content-section">
          <div className="container">
            {tabsSection.content.tabs.map(tab => (
              <div 
                key={tab.id}
                className={`tab-content ${selectedTab === tab.id ? 'active' : ''}`}
              >
                <div className="tab-text">
                  <h2>{tab.title}</h2>
                  <p>{tab.description}</p>
                  {tab.button_text && (
                    <a href={tab.button_url} className="tab-button">
                      {tab.button_text}
                    </a>
                  )}
                </div>
                <div className="tab-image">
                  <img src={tab.image_url} alt={tab.title} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage; 