import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-bootstrap';
import QuotationModal from './QuotationModal';
const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/backend/api/carousel-slides.php', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.status === 'success') {
          setSlides(response.data.data || []);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching slides:', error);
        setError('Failed to load slides');
      } finally {
        setLoading(false);
      }
    };


    fetchSlides();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '600px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
      </div>
    );
  }
  const handleQuotationClick = (product) => {
    setSelectedProduct(product);
    setShowQuotation(true);
  };

  return (
    <Carousel 
      className="hero-carousel"
      interval={5000}
      controls={true}
      indicators={true}
      touch={true}
      wrap={true}
    >
      {slides.map((slide, index) => (
        <Carousel.Item key={slide.id}>
          <div className="carousel-slide">
            <img src={slide.image_url} alt={slide.title} />
            <div className="carousel-content">
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              {slide.product_card && (
                <div className="carousel-product-card">
                  <img src={slide.product_card.icon} alt="" />
                  <div className="carousel-product-card-content">
                    <h3>{slide.product_card.title}</h3>
                    <p>{slide.product_card.description}</p>
                    <button className="btn btn-light" onClick={() => handleQuotationClick(slide.product_card)}>
                      {slide.product_card.buttonText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <QuotationModal 
            show={showQuotation}
            onHide={() => setShowQuotation(false)}
            selectedProduct={selectedProduct}
            productType="Autodesk"
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default HeroCarousel; 