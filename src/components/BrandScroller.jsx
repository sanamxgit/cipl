import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/BrandScroller.css';

const BrandScroller = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [products, setProducts] = useState([]);

  const scrollRef = useRef(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchBrandProducts(selectedBrand.id);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/backend/api/brands.php');
      if (response.data.status === 'success') {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchBrandProducts = async (brandId) => {
    try {
      const response = await axios.get(`/backend/api/products.php?brand_id=${brandId}`);
      if (response.data.status === 'success') {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Adjust this value as needed
      const container = scrollRef.current;
      const newScrollPosition = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="products-section">
      <Container>
        {/* Brand Logos */}
        <div className="brands-grid mb-5">
          <button 
            className="scroll-arrow left" 
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <Row className="g-4" ref={scrollRef}>
            {brands.map((brand) => (
              <Col key={brand.id}>
                <Card 
                  className={`brand-logo-card ${selectedBrand?.id === brand.id ? 'active' : ''}`}
                  onClick={() => setSelectedBrand(brand)}
                >
                  <Card.Img 
                    src={brand.logo_url} 
                    alt={brand.name} 
                    className="brand-logo p-4"
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <button 
            className="scroll-arrow right" 
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        {/* Products Grid */}
        {selectedBrand && (
          <div className="brand-products mt-5 pt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>{selectedBrand.name} Products</h3>
              <button className="btn btn-link browse-more">
                Browse more <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <Row className="g-4 justify-content-center">
              {products.map((product) => (
                <Col key={product.id} xs={12} sm={6} md={6} lg={4}>
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
                        <button className="btn btn-primary">
                          {product.primary_button_text}
                        </button>
                        <button className="btn btn-outline-primary">
                          {product.secondary_button_text}
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BrandScroller; 