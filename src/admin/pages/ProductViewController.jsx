import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const ProductViewController = () => {
  const [productViews, setProductViews] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [formData, setFormData] = useState({
    productId: '',
    bannerImage: '',
    title: '',
    description: '',
    partnerLogo: '',
    partnerName: '',
    slug: '',
    sections: {
      home: { title: '', content: '' },
      business: { title: '', content: '' },
      enterprise: { title: '', content: '' }
    }
  });

  useEffect(() => {
    fetchProductViews();
  }, []);

  const fetchProductViews = async () => {
    try {
      const response = await axios.get('/backend/api/product-views.php');
      if (response.data.status === 'success') {
        setProductViews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching product views:', error);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await axios.post('/backend/api/upload.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setFormData(prev => ({
          ...prev,
          [type]: response.data.file_url
        }));
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Failed to upload ${type}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/backend/api/product-views.php${editMode ? `?id=${selectedProduct.id}` : ''}`;
      const method = editMode ? 'put' : 'post';
      
      const response = await axios({
        method,
        url: endpoint,
        data: formData
      });

      if (response.data.status === 'success') {
        await fetchProductViews();
        resetForm();
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error saving product view:', error);
      alert('Failed to save product view');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product view?')) {
      try {
        await axios.delete(`/backend/api/product-views.php?id=${id}`);
        fetchProductViews();
      } catch (error) {
        console.error('Error deleting product view:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setEditMode(false);
    setFormData({
      productId: '',
      bannerImage: '',
      title: '',
      description: '',
      partnerLogo: '',
      partnerName: '',
      slug: '',
      sections: {
        home: { title: '', content: '' },
        business: { title: '', content: '' },
        enterprise: { title: '', content: '' }
      }
    });
  };

  return (
    <Row>
      <Col md={12}>
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Product View Pages</h5>
            <Button variant="primary" onClick={() => setEditMode(false)}>
              Add New View Page
            </Button>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
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
                    <Form.Label>Banner Image</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => handleImageUpload(e, 'bannerImage')}
                    />
                    {formData.bannerImage && (
                      <img 
                        src={formData.bannerImage} 
                        alt="Banner preview" 
                        className="mt-2" 
                        style={{ maxWidth: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Partner Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.partnerName}
                      onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Partner Logo</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => handleImageUpload(e, 'partnerLogo')}
                    />
                    {formData.partnerLogo && (
                      <img 
                        src={formData.partnerLogo} 
                        alt="Partner logo preview" 
                        className="mt-2" 
                        style={{ height: '50px' }}
                      />
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Editor
                      value={formData.description}
                      onEditorChange={(content) => setFormData({...formData, description: content})}
                      init={{
                        height: 200,
                        menubar: false,
                        plugins: ['lists link image paste'],
                        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist'
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4">
                <h5>Section Content</h5>
                <div className="category-tabs mb-3">
                  {['home', 'business', 'enterprise'].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedCategory(category)}
                      className="me-2"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Section Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.sections[selectedCategory].title}
                    onChange={(e) => setFormData({
                      ...formData,
                      sections: {
                        ...formData.sections,
                        [selectedCategory]: {
                          ...formData.sections[selectedCategory],
                          title: e.target.value
                        }
                      }
                    })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Section Content</Form.Label>
                  <Editor
                    value={formData.sections[selectedCategory].content}
                    onEditorChange={(content) => setFormData({
                      ...formData,
                      sections: {
                        ...formData.sections,
                        [selectedCategory]: {
                          ...formData.sections[selectedCategory],
                          content: content
                        }
                      }
                    })}
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: ['lists link image paste'],
                      toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist'
                    }}
                  />
                </Form.Group>
              </div>

              <div className="mt-4">
                <Button type="submit" variant="primary" className="me-2">
                  {editMode ? 'Update View Page' : 'Create View Page'}
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

        <Card>
          <Card.Header>
            <h5 className="mb-0">Existing View Pages</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Partner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {productViews.map((view) => (
                  <tr key={view.id}>
                    <td>{view.title}</td>
                    <td>{view.partnerName}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setSelectedProduct(view);
                          setFormData(view);
                          setEditMode(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(view.id)}
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
    </Row>
  );
};

export default ProductViewController; 