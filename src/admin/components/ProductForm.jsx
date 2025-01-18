import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const ProductForm = ({ product, onSubmit }) => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(product || {
    name: '',
    description: '',
    image_url: '',
    brand_id: '',
    category_id: '',
    price: '',
    primary_button_text: 'Plans & Pricing',
    secondary_button_text: 'Free Trial',
    is_active: true
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (formData.brand_id === '5') { // Autodesk brand ID
      fetchAutodeskCategories();
    } else {
      setCategories([]);
    }
  }, [formData.brand_id]);

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

  const fetchAutodeskCategories = async () => {
    try {
      const response = await axios.get('/backend/api/autodesk-categories.php');
      if (response.data.status === 'success') {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <Form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      <Form.Group className="mb-3">
        <Form.Label>Brand</Form.Label>
        <Form.Select
          value={formData.brand_id}
          onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
          required
        >
          <option value="">Select Brand</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </Form.Select>
      </Form.Group>

      {formData.brand_id === '5' && (
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Product Name</Form.Label>
        <Form.Control
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </Form.Group>

      <Button type="submit" variant="primary">
        {product ? 'Update Product' : 'Add Product'}
      </Button>
    </Form>
  );
};

export default ProductForm; 