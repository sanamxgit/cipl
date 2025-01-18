import React from 'react';
import './MicrosoftProducts.css';

const MicrosoftProducts = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="ms-products-section">
      <div className="ms-products-container">
        <h2>Microsoft Products</h2>
        <div className="ms-products-grid">
          {products.map((product) => (
            <div key={product.id} className="ms-product-card">
              <div className="ms-product-image">
                <img src={product.image_url} alt={product.name} />
              </div>
              <div className="ms-product-content">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="ms-product-price">${product.price}</div>
                <button className="ms-product-button">Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MicrosoftProducts; 