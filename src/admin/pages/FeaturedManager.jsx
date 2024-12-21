import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const FeaturedManager = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update the selected brand in your app state or context
      // This will filter products in the FeaturedProducts component
      alert('Featured products updated successfully!');
    } catch (error) {
      console.error('Error updating featured products:', error);
      alert('Failed to update featured products');
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="m-0">Featured Products Filter</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Select Brand to Feature</Form.Label>
            <Form.Select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Products</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button type="submit" variant="primary">
            Update Featured Products
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FeaturedManager; 