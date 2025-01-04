import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/BrandScroller.css';

const BrandScroller = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [showBrandLeftArrow, setShowBrandLeftArrow] = useState(false);
  const [showBrandRightArrow, setShowBrandRightArrow] = useState(true);
  const [showProductLeftArrow, setShowProductLeftArrow] = useState(false);
  const [showProductRightArrow, setShowProductRightArrow] = useState(true);

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

  const checkBrandScroll = () => {
    const container = document.querySelector('.brands-container');
    if (container) {
      setShowBrandLeftArrow(container.scrollLeft > 0);
      setShowBrandRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const checkProductScroll = () => {
    const container = document.querySelector('.products-row');
    if (container) {
      setShowProductLeftArrow(container.scrollLeft > 0);
      setShowProductRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const handleBrandScroll = (direction) => {
    const container = document.querySelector('.brands-container');
    if (container) {
      const scrollAmount = 300;
      const currentScroll = container.scrollLeft;
      container.scrollTo({
        left: currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth'
      });
      setTimeout(checkBrandScroll, 500);
    }
  };

  const handleProductScroll = (direction) => {
    const container = document.querySelector('.products-row');
    if (container) {
      const scrollAmount = 300;
      const currentScroll = container.scrollLeft;
      container.scrollTo({
        left: currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth'
      });
      setTimeout(checkProductScroll, 500);
    }
  };

  useEffect(() => {
    const brandContainer = document.querySelector('.brands-container');
    const productContainer = document.querySelector('.products-row');

    if (brandContainer) {
      brandContainer.addEventListener('scroll', checkBrandScroll);
      checkBrandScroll();
    }

    if (productContainer) {
      productContainer.addEventListener('scroll', checkProductScroll);
      checkProductScroll();
    }

    return () => {
      if (brandContainer) {
        brandContainer.removeEventListener('scroll', checkBrandScroll);
      }
      if (productContainer) {
        productContainer.removeEventListener('scroll', checkProductScroll);
      }
    };
  }, [selectedBrand]);

  return (
    <div className="products-section">
      <Container>
        {/* Brand Logos */}
        <div className="brands-grid mb-5">
          {showBrandLeftArrow && (
            <div 
              className="scroll-arrow left" 
              onClick={() => handleBrandScroll('left')}
            >
              <i className="fas fa-chevron-left"></i>
            </div>
          )}
          <div className="brands-container">
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
          </div>
          {showBrandRightArrow && (
            <div 
              className="scroll-arrow right" 
              onClick={() => handleBrandScroll('right')}
            >
              <i className="fas fa-chevron-right"></i>
            </div>
          )}
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
            <div className="products-grid">
              {showProductLeftArrow && (
                <div 
                  className="scroll-arrow left" 
                  onClick={() => handleProductScroll('left')}
                >
                  <i className="fas fa-chevron-left"></i>
                </div>
              )}
              <div 
                className="products-row" 
                ref={productsRowRef}
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
                          <button className="btn btn-primary">
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
              {showProductRightArrow && (
                <div 
                  className="scroll-arrow right" 
                  onClick={() => handleProductScroll('right')}
                >
                  <i className="fas fa-chevron-right"></i>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BrandScroller; 