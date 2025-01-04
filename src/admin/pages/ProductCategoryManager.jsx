import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';

const ProductCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    banner_gradient_start: '#f0f4f8',
    banner_gradient_end: '#d9e2ec',
    title: 'Get started with Microsoft Office 365 today',
    subtitle: 'Collaborate, create, and achieve more with the world\'s leading productivity suite.',
    main_heading: 'Unlock productivity, creativity, and generative AI for your organization.',
    main_description: 'Microsoft 365 empowers your employees to do their best work with the power of generative AI in the apps they use daily.',
    floating_icons: [], // Array of icon URLs
    sections: {
      home: { title: '', content: '' },
      business: { title: '', content: '' },
      enterprise: { title: '', content: '' }
    }
  });

  // Live Preview Panel
  const PreviewPanel = () => (
    <div className="preview-container" style={{ border: '1px solid #dee2e6', borderRadius: '4px' }}>
      <div className="product-category-view" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
        <div className="hero-banner" style={{
          background: `linear-gradient(135deg, ${formData.banner_gradient_start} 0%, ${formData.banner_gradient_end} 100%)`
        }}>
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h1>{formData.title}</h1>
            <p className="subtitle">{formData.subtitle}</p>
          </div>
          <div className="floating-icons">
            <div className="icon-container">
              {formData.floating_icons.map((icon, index) => (
                <img 
                  key={index}
                  src={icon}
                  alt={`Icon ${index + 1}`}
                  className={`floating-icon icon${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="category-selector">
          <div className="container">
            <div className="category-buttons">
              {['home', 'business', 'enterprise'].map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  For {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container main-content">
          <div className="content-section">
            <h2>{formData.main_heading}</h2>
            <p className="description">{formData.main_description}</p>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/backend/api/product-categories.php');
      if (response.data.status === 'success') {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/backend/api/product-categories.php${editMode ? `?id=${selectedCategory.id}` : ''}`;
      const method = editMode ? 'put' : 'post';
      
      const response = await axios({
        method,
        url: endpoint,
        data: formData
      });

      if (response.data.status === 'success') {
        await fetchCategories();
        resetForm();
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('icon', file);

    try {
      const response = await axios.post('/backend/api/upload.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setFormData(prev => ({
          ...prev,
          floating_icons: [...prev.floating_icons, response.data.file_url]
        }));
      }
    } catch (error) {
      console.error('Error uploading icon:', error);
    }
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setEditMode(false);
    setFormData({
      name: '',
      slug: '',
      banner_gradient_start: '#f0f4f8',
      banner_gradient_end: '#d9e2ec',
      title: '',
      subtitle: '',
      main_heading: '',
      main_description: '',
      floating_icons: [],
      sections: {
        home: { title: '', content: '' },
        business: { title: '', content: '' },
        enterprise: { title: '', content: '' }
      }
    });
  };

  return (
    <Row>
      <Col md={7}>
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Product Category Pages</h5>
            <Button variant="primary" onClick={() => setEditMode(false)}>
              Add New Category
            </Button>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Slug</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Banner Gradient Start</Form.Label>
                    <Form.Control
                      type="color"
                      value={formData.banner_gradient_start}
                      onChange={(e) => setFormData({...formData, banner_gradient_start: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Banner Gradient End</Form.Label>
                    <Form.Control
                      type="color"
                      value={formData.banner_gradient_end}
                      onChange={(e) => setFormData({...formData, banner_gradient_end: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Banner Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Banner Subtitle</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Floating Icons</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleIconUpload}
                  accept="image/*"
                />
                <div className="mt-2 d-flex gap-2">
                  {formData.floating_icons.map((icon, index) => (
                    <img 
                      key={index}
                      src={icon}
                      alt={`Icon ${index + 1}`}
                      style={{ width: '50px', height: '50px' }}
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Main Heading</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.main_heading}
                  onChange={(e) => setFormData({...formData, main_heading: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Main Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.main_description}
                  onChange={(e) => setFormData({...formData, main_description: e.target.value})}
                  required
                />
              </Form.Group>

              <div className="mt-4">
                <Button type="submit" variant="primary" className="me-2">
                  {editMode ? 'Update Category' : 'Create Category'}
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

      <Col md={5}>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Live Preview</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <PreviewPanel />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ProductCategoryManager; 