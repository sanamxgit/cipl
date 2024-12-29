import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';
import ImageGrid from '../../components/ImageGrid';

const ImageGridManager = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('/backend/api/image-grid.php');
      if (response.data.status === 'success') {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log('Submitting form data:', formData); // Debug log
        
        const endpoint = `/backend/api/image-grid.php${editMode ? `?id=${selectedImage.id}` : ''}`;
        const method = editMode ? 'put' : 'post';
        
        console.log('Making request to:', endpoint, 'with method:', method); // Debug log
        
        const response = await axios({
            method,
            url: endpoint,
            data: formData,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response:', response.data); // Debug log

        if (response.data.status === 'success') {
            await fetchImages();
            resetForm();
            alert(editMode ? 'Image updated successfully!' : 'Image added successfully!');
        } else {
            throw new Error(response.data.message || 'Failed to save image');
        }
    } catch (error) {
        console.error('Error saving image:', error);
        console.error('Error details:', error.response?.data); // Debug log
        alert('Failed to save image: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (image) => {
    setSelectedImage(image);
    setFormData({
      title: image.title,
      description: image.description,
      image_url: image.image_url,
      is_active: image.is_active
    });
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await axios.delete(`/backend/api/image-grid.php?id=${id}`);
        await fetchImages();
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Failed to delete image');
      }
    }
  };

  const handleToggleStatus = async (image) => {
    try {
      const response = await axios.put(`/backend/api/image-grid.php?id=${image.id}`, {
        ...image,
        is_active: !image.is_active
      });

      if (response.data.status === 'success') {
        setImages(images.map(img => 
          img.id === image.id 
            ? { ...img, is_active: !img.is_active }
            : img
        ));
      }
    } catch (error) {
      console.error('Error toggling image status:', error);
      alert('Failed to update image status');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setEditMode(false);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      is_active: true
    });
  };

  return (
    <Row>
      <Col md={8}>
        <Card className="mb-4">
          <Card.Header>
            <h5 className="m-0">Live Preview</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <ImageGrid images={images} />
          </Card.Body>
        </Card>

        {/* Images List */}
        <Card>
          <Card.Header>
            <h5 className="m-0">All Images</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {images.map((image) => (
                  <tr key={image.id}>
                    <td>
                      <img 
                        src={image.image_url} 
                        alt={image.title} 
                        style={{ height: '50px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>{image.title}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={image.is_active}
                        onChange={() => handleToggleStatus(image)}
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(image)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(image.id)}
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
            <h5 className="m-0">{editMode ? 'Edit Image' : 'Add New Image'}</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
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
                <Form.Check
                  type="switch"
                  label="Active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">
                  {editMode ? 'Update Image' : 'Add Image'}
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

export default ImageGridManager; 