import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useFeatured } from '../../context/FeaturedContext';

const FeaturedManager = () => {
  const { selectedFeaturedBrand, setSelectedFeaturedBrand } = useFeatured();
  const [brands, setBrands] = useState([]);

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
      // Save to localStorage to persist the selection
      localStorage.setItem('featuredBrand', selectedFeaturedBrand);
      alert('Featured brand updated successfully!');
    } catch (error) {
      console.error('Error updating featured brand:', error);
      alert('Failed to update featured brand');
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="m-0">Featured Products Settings</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Select Brand to Feature</Form.Label>
            <Form.Select
              value={selectedFeaturedBrand || ''}
              onChange={(e) => setSelectedFeaturedBrand(e.target.value)}
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
            Update Featured Brand
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FeaturedManager; 