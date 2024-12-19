import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CarouselManager = () => {
  const [slides, setSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({
    title: '',
    description: '',
    imageUrl: '',
    productCard: {
      title: '',
      description: '',
      icon: '',
      buttonText: ''
    }
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await axios.get('/api/carousel-slides');
      setSlides(response.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/carousel-slides', newSlide);
      fetchSlides();
      setNewSlide({
        title: '',
        description: '',
        imageUrl: '',
        productCard: {
          title: '',
          description: '',
          icon: '',
          buttonText: ''
        }
      });
    } catch (error) {
      console.error('Error adding slide:', error);
    }
  };

  return (
    <div className="carousel-manager">
      <h2>Manage Carousel Slides</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={newSlide.title}
            onChange={(e) => setNewSlide({...newSlide, title: e.target.value})}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={newSlide.description}
            onChange={(e) => setNewSlide({...newSlide, description: e.target.value})}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            value={newSlide.imageUrl}
            onChange={(e) => setNewSlide({...newSlide, imageUrl: e.target.value})}
            className="form-control"
          />
        </div>
        <h3>Product Card Details</h3>
        <div className="form-group">
          <label>Product Title</label>
          <input
            type="text"
            value={newSlide.productCard.title}
            onChange={(e) => setNewSlide({
              ...newSlide,
              productCard: {...newSlide.productCard, title: e.target.value}
            })}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Slide</button>
      </form>

      <div className="slides-list">
        <h3>Current Slides</h3>
        {slides.map((slide, index) => (
          <div key={index} className="slide-item">
            <h4>{slide.title}</h4>
            <img src={slide.imageUrl} alt={slide.title} style={{width: '200px'}} />
            <button
              onClick={async () => {
                await axios.delete(`/api/carousel-slides/${slide.id}`);
                fetchSlides();
              }}
              className="btn btn-danger"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselManager; 