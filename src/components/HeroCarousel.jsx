import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-bootstrap';

const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Carousel className="hero-carousel">
      {slides.length > 0 ? (
        slides.map((slide, index) => (
          <Carousel.Item key={index}>
            <div className="carousel-slide" style={{ backgroundImage: `url(${slide.image_url})` }}>
              <div className="carousel-content">
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
                {slide.product_card && (
                  <div className="product-card">
                    <img src={slide.product_card.icon} alt={slide.product_card.title} />
                    <h3>{slide.product_card.title}</h3>
                    <p>{slide.product_card.description}</p>
                    <button className="btn btn-primary">{slide.product_card.buttonText}</button>
                  </div>
                )}
              </div>
            </div>
          </Carousel.Item>
        ))
      ) : (
        <Carousel.Item>
          <div className="carousel-slide">
            <div className="carousel-content">
              <h2>Welcome to Cyber International</h2>
              <p>No slides available at the moment</p>
            </div>
          </div>
        </Carousel.Item>
      )}
    </Carousel>
  );
};

export default HeroCarousel; 