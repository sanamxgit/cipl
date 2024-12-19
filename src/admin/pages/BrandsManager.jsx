import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';

const BrandsManager = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
    is_active: true
  });

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
      const endpoint = `/backend/api/brands.php${editMode ? `?id=${selectedBrand.id}` : ''}`;
      const method = editMode ? 'put' : 'post';
      
      const response = await axios({
        method,
        url: endpoint,
        data: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        await fetchBrands();
        resetForm();
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      alert(error.response?.data?.message || 'Failed to save brand');
    }
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      logo_url: brand.logo_url,
      description: brand.description,
      is_active: brand.is_active
    });
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await axios.delete(`/backend/api/brands.php?id=${id}`);
        fetchBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await axios.put(`/backend/api/brands.php?id=${id}&action=toggle`);
      fetchBrands();
    } catch (error) {
      console.error('Error toggling brand status:', error);
    }
  };

  const resetForm = () => {
    setSelectedBrand(null);
    setEditMode(false);
    setFormData({
      name: '',
      logo_url: '',
      description: '',
      is_active: true
    });
  };

  return (
    <Row>
      <Col md={8}>
        <Card>
          <Card.Header>
            <h5 className="m-0">Brands List</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name} 
                        style={{ height: '40px' }}
                      />
                    </td>
                    <td>{brand.name}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={brand.is_active}
                        onChange={() => handleToggleActive(brand.id)}
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(brand)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(brand.id)}
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
            <h5 className="m-0">{editMode ? 'Edit Brand' : 'Add New Brand'}</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Brand Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Logo URL</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
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
                <Form.Check
                  type="switch"
                  label="Active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">
                  {editMode ? 'Update Brand' : 'Add Brand'}
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

export default BrandsManager; 