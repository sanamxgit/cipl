import React, { useEffect, useRef } from 'react';
import './ImageGrid.css';

const ImageGrid = ({ images = [] }) => {
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current && images.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate');
            }
          });
        },
        { threshold: 0.1 }
      );

      const gridItems = gridRef.current.querySelectorAll('.grid-item');
      gridItems.forEach(item => observer.observe(item));

      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="text-center p-4">
        No images available
      </div>
    );
  }

  const gridPositions = [
    'item1',
    'item2',
    'item3',
    'item4',
    'item5'
  ];

  const activeImages = images
    .filter(image => image.is_active)
    .slice(0, 5);

  return (
    <section className="image-grid-section">
      <div className="container">
        <div className="image-grid" ref={gridRef}>
          {activeImages.map((image, index) => (
            <div 
              key={image.id} 
              className={`grid-item ${gridPositions[index]}`}
            >
              <div className="content">
                <h3>{image.title}</h3>
                <p>{image.description}</p>
                <span className="number">{index + 1}</span>
              </div>
              <img src={image.image_url} alt={image.title} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageGrid; 