import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import api from '../utils/api';
import { useFeatured } from '../context/FeaturedContext';
import './FeaturedProducts.css';
import QuotationModal from './QuotationModal';

const FeaturedProducts = () => {
  const { selectedFeaturedBrand } = useFeatured();
  const [products, setProducts] = useState([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const productsRowRef = useRef(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [selectedFeaturedBrand]);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products for brand:', selectedFeaturedBrand);
      const url = selectedFeaturedBrand
        ? `/products.php?brand_id=${selectedFeaturedBrand}`
        : '/products.php';
      
      console.log('Fetching from URL:', url);
      const response = await api.get(url);
      
      if (response.data.status === 'success') {
        const activeProducts = response.data.data.filter(product => product.is_active);
        setProducts(activeProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    setShowLeftArrow(container.scrollLeft > 0);
  };

  const handleQuotationClick = (product) => {
    setSelectedProduct(product);
    setShowQuotation(true);
  };

  const scroll = (direction) => {
    if (productsRowRef.current) {
      const scrollAmount = 400;
      const container = productsRowRef.current;
      const newScrollPosition = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="featured-products">
      <Container>
        <h2 className="text-center mb-5">Featured Products</h2>
        <div className="products-grid">
          {showLeftArrow && (
            <button 
              className="scroll-arrow left"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <i className="fas fa-angle-left"></i>
            </button>
          )}
          
          <div 
            className="products-row" 
            ref={productsRowRef}
            onScroll={handleScroll}
          >
            {products.map((product) => (
              <div key={product.id} className="product-card-wrapper">
                <Card className="product-card">
                  <Card.Img 
                    variant="top" 
                    src={product.image_url} 
                    alt={product.name}
                  />
                  <Card.Body>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text>{product.description}</Card.Text>
                    <div className="btn-container">
                      <button className="btn btn-primary" onClick={() => handleQuotationClick(product)}>
                        {product.primary_button_text}
                      </button>
                      <button className="btn btn-outline-primary">
                        {product.secondary_button_text}
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>

          <button 
            className="scroll-arrow right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <i className="fas fa-angle-right"></i>
          </button>
        </div>
        <QuotationModal 
          show={showQuotation}
          onHide={() => setShowQuotation(false)}
          selectedProduct={selectedProduct}
          productType="Autodesk"
        />
      </Container>
    </section>
  );
};

export default FeaturedProducts; 