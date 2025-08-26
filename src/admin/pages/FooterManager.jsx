import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table } from 'react-bootstrap';
import axios from '../../config/axios';
import Preview from '../components/Preview';
import Footer from '../../components/Footer';

const FooterManager = () => {
  const [footerItems, setFooterItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    section: 'developers', // developers, company, social
    title: '',
    link_text: '',
    link_url: '',
    position: 0,
    is_active: true
  });
  const [showPreview, setShowPreview] = useState(false);

  const sections = [
    { value: 'description', label: 'Company Description' },
    { value: 'partners', label: 'Partners' },
    { value: 'company', label: 'Company' },
    { value: 'social', label: 'Social' }
  ];

  useEffect(() => {
    fetchFooterItems();
  }, []);

  const fetchFooterItems = async () => {
    try {
      const response = await axios.get('/footer-content.php');
      if (response.data.status === 'success') {
        setFooterItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching footer items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/footer-content.php${editMode ? `?id=${selectedItem.id}` : ''}`;
      const method = editMode ? 'put' : 'post';
      
      const response = await axios({
        method,
        url: endpoint,
        data: formData
      });

      if (response.data.status === 'success') {
        await fetchFooterItems();
        resetForm();
        alert(editMode ? 'Footer item updated successfully!' : 'Footer item added successfully!');
      }
    } catch (error) {
      console.error('Error saving footer item:', error);
      alert('Failed to save footer item');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      section: item.section,
      title: item.title,
      link_text: item.link_text,
      link_url: item.link_url,
      position: item.position,
      is_active: item.is_active
    });
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this footer item?')) {
      try {
        await axios.delete(`/footer-content.php?id=${id}`);
        await fetchFooterItems();
      } catch (error) {
        console.error('Error deleting footer item:', error);
        alert('Failed to delete footer item');
      }
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const response = await axios.put(`/footer-content.php?id=${item.id}`, {
        ...item,
        is_active: !item.is_active
      });

      if (response.data.status === 'success') {
        setFooterItems(footerItems.map(f => 
          f.id === item.id 
            ? { ...f, is_active: !f.is_active }
            : f
        ));
      }
    } catch (error) {
      console.error('Error toggling footer item status:', error);
      alert('Failed to update footer item status');
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setEditMode(false);
    setFormData({
      section: 'developers',
      title: '',
      link_text: '',
      link_url: '',
      position: 0,
      is_active: true
    });
  };

  return (
    <>
      <Row className="mb-4">
        <Col>
          <Button 
            variant="outline-primary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </Col>
      </Row>

      {showPreview && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="m-0">Live Preview</h5>
              </Card.Header>
              <Card.Body>
                <Preview>
                  <Footer />
                </Preview>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="m-0">Footer Content List</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Title</th>
                    <th>Link Text</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {footerItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.section}</td>
                      <td>{item.title}</td>
                      <td>{item.link_text}</td>
                      <td>{item.position}</td>
                      <td>
                        <Form.Check
                          type="switch"
                          checked={item.is_active}
                          onChange={() => handleToggleStatus(item)}
                        />
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
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
              <h5 className="m-0">{editMode ? 'Edit Footer Item' : 'Add Footer Item'}</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Section</Form.Label>
                  <Form.Select
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                  >
                    {sections.map(section => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {formData.section === 'description' ? (
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      required
                    />
                  </Form.Group>
                ) : (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Link Text</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.link_text}
                        onChange={(e) => setFormData({...formData, link_text: e.target.value})}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Link URL</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.link_url}
                        onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: parseInt(e.target.value)})}
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
                    {editMode ? 'Update Item' : 'Add Item'}
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
    </>
  );
};

export default FooterManager; 