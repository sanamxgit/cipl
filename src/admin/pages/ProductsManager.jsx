import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import api from '../../utils/api';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    brand_id: '',
    name: '',
    description: '',
    image_url: '',
    price: '',
    primary_button_text: 'Plans & Pricing',
    secondary_button_text: 'Free Trial',
    is_active: true
  });
  const [selectedCategory, setSelectedCategory] = useState('home');

  useEffect(() => {
    fetchBrands();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const url = selectedBrand 
        ? `/products.php?brand_id=${selectedBrand}&admin=true`
        : '/products.php?admin=true';
      const response = await api.get(url);
      if (response.data.status === 'success') {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Convert brand_id to number since it comes as string from select
        const dataToSend = {
            ...formData,
            brand_id: parseInt(formData.brand_id),
            price: parseFloat(formData.price) || 0
        };

        console.log('Sending data:', dataToSend); // Debug log

        const endpoint = `/products.php${editMode ? `?id=${selectedProduct.id}` : ''}`;
        const method = editMode ? 'put' : 'post';
        
        const response = await api({
            method,
            url: endpoint,
            data: dataToSend,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Response:', response.data); // Debug log

        if (response.data.status === 'success') {
            await fetchProducts();
            resetForm();
            alert(response.data.message);
        } else {
            throw new Error(response.data.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        console.error('Error details:', error.response?.data); // Debug log
        alert(error.response?.data?.message || error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      brand_id: product.brand_id,
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      price: product.price,
      primary_button_text: product.primary_button_text,
      secondary_button_text: product.secondary_button_text,
      is_active: product.is_active
    });
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products.php?id=${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setEditMode(false);
    setFormData({
      brand_id: '',
      name: '',
      description: '',
      image_url: '',
      price: '',
      primary_button_text: 'Plans & Pricing',
      secondary_button_text: 'Free Trial',
      is_active: true
    });
  };

  const handleToggleStatus = async (product) => {
    try {
      const response = await api.put(`/products.php?id=${product.id}`, {
        is_active: !product.is_active
      });

      if (response.data.status === 'success') {
        setProducts(products.map(p => 
          p.id === product.id 
            ? { ...p, is_active: !p.is_active }
            : p
        ));
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Failed to update product status');
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <Row>
      <Col md={8}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="m-0">Products List</h5>
            <div className="d-flex gap-3 align-items-center">
              <Form.Select 
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Form.Select>
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowAddModal(true);
                  resetForm();
                }}
              >
                Add Product
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        style={{ height: '40px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>
                      {brands.find(b => b.id === product.brand_id)?.name}
                    </td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={product.is_active}
                        onChange={() => handleToggleStatus(product)}
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card>
          <Card.Header>
            <h5 className="m-0">{editMode ? 'Edit Product' : 'Add New Product'}</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  step="0.01"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Primary Button Text</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.primary_button_text}
                  onChange={(e) => setFormData({...formData, primary_button_text: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Secondary Button Text</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.secondary_button_text}
                  onChange={(e) => setFormData({...formData, secondary_button_text: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>URL Slug</Form.Label>
                <Form.Control 
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="e.g., microsoft-office-365"
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">
                  {editMode ? 'Update Product' : 'Add Product'}
                </Button>
                {editMode && (
                  <Button variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ProductsManager; 