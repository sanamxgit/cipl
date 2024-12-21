import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [selectedBrandId]);

  const fetchProducts = async () => {
    try {
      const url = selectedBrandId 
        ? `/backend/api/products.php?brand_id=${selectedBrandId}`
        : '/backend/api/products.php';
      
      const response = await axios.get(url);
      if (response.data.status === 'success') {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <section className="featured-products">
      <Container>
        <h2 className="text-center mb-5">Featured Products</h2>
        <Row className="g-4 justify-content-center">
          {products.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4}>
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
      </Container>
    </section>
  );
};

export default FeaturedProducts; 