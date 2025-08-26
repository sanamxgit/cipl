import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/BrandScroller.css';
import QuotationModal from './QuotationModal';

const BrandScroller = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const scrollRef = useRef(null);
  const productsRowRef = useRef(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0]);
    }
  }, [brands]);

  useEffect(() => {
    if (selectedBrand) {
      fetchBrandProducts(selectedBrand.id);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands.php');
      if (response.data.status === 'success') {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchBrandProducts = async (brandId) => {
    try {
      const response = await api.get(`/products.php?brand_id=${brandId}`);
      if (response.data.status === 'success') {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const scroll = (direction, type) => {
    const targetRef = type === 'brands' ? scrollRef : productsRowRef;
    if (targetRef.current) {
      const scrollAmount = 300;
      const container = targetRef.current;
      const newScrollPosition = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
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

  return (
    <div className="products-section bg-white">
      <Container>
        {/* Brand Logos */}
        <div className="brands-grid mb-5 position-relative">
          {showLeftArrow && (
            <button 
              className="scroll-arrow left" 
              onClick={() => scroll('left', 'brands')}
              aria-label="Scroll left"
            >
              <i className="fas fa-angle-left"></i>
            </button>
          )}
          
          <Row 
            className="brands-row g-4" 
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {brands.map((brand) => (
              <Col key={brand.id} className="brand-col">
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
            onClick={() => scroll('right', 'brands')}
            aria-label="Scroll right"
          >
            <i className="fas fa-angle-right"></i>
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
            <div className="products-grid position-relative">
              {showLeftArrow && (
                <button 
                  className="scroll-arrow left" 
                  onClick={() => scroll('left', 'products')}
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
                onClick={() => scroll('right', 'products')}
                aria-label="Scroll right"
              >
                <i className="fas fa-angle-right  "></i>
              </button>
            </div>
          </div>
        )}
        <QuotationModal 
          show={showQuotation}
          onHide={() => setShowQuotation(false)}
          product={selectedProduct}
        />
      </Container>
    </div>
  );
};

export default BrandScroller; 