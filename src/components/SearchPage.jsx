import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchTerm(query);
    if (query) {
      fetchProducts();
    }
  }, [searchParams]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products.php');
      if (response.data.status === 'success') {
        const activeProducts = response.data.data.filter(product => product.is_active);
        setProducts(activeProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      // If search is blank, show all active products
      setFilteredProducts(products);
    } else {
      // Filter products based on search term
      const filtered = products.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          (product.brand_name && product.brand_name.toLowerCase().includes(searchLower)) ||
          (product.category && product.category.toLowerCase().includes(searchLower))
        );
      });
      setFilteredProducts(filtered);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleProductClick = (product) => {
    // Navigate to product page or open quotation modal
    console.log('Product clicked:', product);
    // You can implement navigation to product page here
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="search-page">
      <Container>
        {/* Header */}
        <div className="search-header mb-4">
          <Button 
            variant="outline-secondary" 
            onClick={handleBackToHome}
            className="back-btn mb-3"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Home
          </Button>
          
          <h1 className="search-title">Search Products</h1>
          
          <Form onSubmit={handleSearchSubmit} className="search-form">
            <InputGroup size="lg">
              <Form.Control
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <Button variant="primary" type="submit" className="search-btn">
                <i className="fas fa-search"></i>
              </Button>
            </InputGroup>
          </Form>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3">Loading products...</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <>
            <div className="search-results-header mb-4">
              <h4 className="mb-0">
                {searchTerm.trim() 
                  ? `Found ${filteredProducts.length} product(s) for "${searchTerm}"`
                  : `Showing all ${filteredProducts.length} active products`
                }
              </h4>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-search fa-4x text-muted mb-4"></i>
                <h3 className="text-muted">No products found</h3>
                <p className="text-muted fs-5">
                  {searchTerm.trim() 
                    ? `No products match "${searchTerm}". Try different keywords.`
                    : 'No active products available.'
                  }
                </p>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleBackToHome}
                >
                  Browse All Products
                </Button>
              </div>
            ) : (
              <Row className="g-4">
                {filteredProducts.map((product) => (
                  <Col key={product.id} lg={4} md={6}>
                    <Card 
                      className="product-result-card h-100"
                      onClick={() => handleProductClick(product)}
                    >
                      <Card.Img 
                        variant="top" 
                        src={product.image_url} 
                        alt={product.name}
                        className="product-image"
                      />
                      <Card.Body>
                        <Card.Title className="product-title">{product.name}</Card.Title>
                        <Card.Text className="product-description">
                          {product.description}
                        </Card.Text>
                        {product.brand_name && (
                          <div className="product-brand">
                            <span className="badge bg-secondary">{product.brand_name}</span>
                          </div>
                        )}
                      </Card.Body>
                      <Card.Footer className="bg-transparent">
                        <div className="d-flex gap-2">
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                          >
                            {product.primary_button_text || 'Get Quote'}
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                          >
                            {product.secondary_button_text || 'Contact Us'}
                          </Button>
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default SearchPage;
