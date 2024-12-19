import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import HeroCarousel from '../../components/HeroCarousel';

const AdminHome = () => {
  const [slides, setSlides] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    product_card: {
      title: '',
      description: '',
      icon: '',
      buttonText: ''
    }
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    const testCORS = async () => {
      try {
        const response = await axios.get('/backend/api/test.php', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        console.log('CORS test response:', response.data);
      } catch (error) {
        console.error('CORS test error:', error);
      }
    };
    testCORS();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await axios.get('/backend/api/carousel-slides.php', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (response.data && response.data.status === 'success') {
        setSlides(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const handleEdit = (slide) => {
    setSelectedSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description,
      image_url: slide.image_url,
      product_card: slide.product_card || {
        title: '',
        description: '',
        icon: '',
        buttonText: ''
      }
    });
    setEditMode(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const endpoint = `/backend/api/carousel-slides.php${editMode ? `?id=${selectedSlide.id}` : ''}`;
        const method = editMode ? 'put' : 'post';
        
        console.log('Request details:', {
            method,
            endpoint,
            formData,
            editMode,
            selectedSlideId: selectedSlide?.id
        });

        const response = await axios({
            method,
            url: endpoint,
            data: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Complete response:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        });

        if (response.data && response.data.status === 'success') {
            await fetchSlides();
            resetForm();
            alert(response.data.message || (editMode ? 'Slide updated successfully!' : 'Slide added successfully!'));
        } else {
            console.error('Response indicates failure:', response.data);
            throw new Error(response.data?.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Full error details:', {
            message: error.message,
            response: error.response,
            request: error.request,
            config: error.config
        });
        alert(error.response?.data?.message || error.message || 'Failed to save slide. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      try {
        await axios.delete(`/backend/api/carousel-slides.php?id=${id}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        fetchSlides();
      } catch (error) {
        console.error('Error deleting slide:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedSlide(null);
    setEditMode(false);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      product_card: {
        title: '',
        description: '',
        icon: '',
        buttonText: ''
      }
    });
  };

  return (
    <Row>
      {/* Live Preview */}
      <Col md={8}>
        <Card className="mb-4">
          <Card.Header>
            <h5 className="m-0">Live Preview</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <HeroCarousel />
          </Card.Body>
        </Card>
      </Col>

      {/* Editor */}
      <Col md={4}>
        <Card>
          <Card.Header>
            <h5 className="m-0">{editMode ? 'Edit Slide' : 'Add New Slide'}</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                />
              </Form.Group>

              <h6 className="mt-4">Product Card</h6>
              <Form.Group className="mb-3">
                <Form.Label>Product Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.product_card.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    product_card: {...formData.product_card, title: e.target.value}
                  })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Product Description</Form.Label>
                <Form.Control
                  as="textarea"
                  value={formData.product_card.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    product_card: {...formData.product_card, description: e.target.value}
                  })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Product Icon URL</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.product_card.icon}
                  onChange={(e) => setFormData({
                    ...formData,
                    product_card: {...formData.product_card, icon: e.target.value}
                  })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Button Text</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.product_card.buttonText}
                  onChange={(e) => setFormData({
                    ...formData,
                    product_card: {...formData.product_card, buttonText: e.target.value}
                  })}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">
                  {editMode ? 'Update Slide' : 'Add Slide'}
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

        {/* Slides List */}
        <Card className="mt-4">
          <Card.Header>
            <h5 className="m-0">All Slides</h5>
          </Card.Header>
          <Card.Body>
            {slides.map((slide, index) => (
              <div key={index} className="border-bottom pb-3 mb-3">
                <h6>{slide.title}</h6>
                <img 
                  src={slide.image_url} 
                  alt={slide.title} 
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }} 
                />
                <div className="d-flex gap-2 mt-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleEdit(slide)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDelete(slide.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AdminHome; 