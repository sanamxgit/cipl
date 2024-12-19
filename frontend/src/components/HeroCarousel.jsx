import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-bootstrap';

const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axios.get('/api/carousel-slides');
        setSlides(response.data);
      } catch (error) {
        console.error('Error fetching slides:', error);
      }
    };
    fetchSlides();
  }, []);

  return (
    <Carousel className="hero-carousel">
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <div className="carousel-slide" style={{ backgroundImage: `url(${slide.imageUrl})` }}>
            <div className="carousel-content">
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              {slide.productCard && (
                <div className="product-card">
                  <img src={slide.productCard.icon} alt={slide.productCard.title} />
                  <h3>{slide.productCard.title}</h3>
                  <p>{slide.productCard.description}</p>
                  <button className="btn btn-primary">{slide.productCard.buttonText}</button>
                </div>
              )}
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default HeroCarousel; 