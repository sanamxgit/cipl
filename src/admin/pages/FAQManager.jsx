import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table } from 'react-bootstrap';
import api from '../../utils/api';
import './FAQManager.css';

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    is_active: true,
    position: 0
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await api.get('/faqs.php');
      if (response.data.status === 'success') {
        setFaqs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/faqs.php${editMode ? `?id=${selectedFaq.id}` : ''}`;
      const method = editMode ? 'put' : 'post';
      
      const response = await api({
        method,
        url: endpoint,
        data: formData
      });

      if (response.data.status === 'success') {
        await fetchFaqs();
        resetForm();
        alert(editMode ? 'FAQ updated successfully!' : 'FAQ added successfully!');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
    }
  };

  const handleEdit = (faq) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active,
      position: faq.position
    });
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await api.delete(`/faqs.php?id=${id}`);
        await fetchFaqs();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        alert('Failed to delete FAQ');
      }
    }
  };

  const handleToggleStatus = async (faq) => {
    try {
      const response = await api.put(`/faqs.php?id=${faq.id}`, {
        ...faq,
        is_active: !faq.is_active
      });

      if (response.data.status === 'success') {
        setFaqs(faqs.map(f => 
          f.id === faq.id 
            ? { ...f, is_active: !f.is_active }
            : f
        ));
      }
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
      alert('Failed to update FAQ status');
    }
  };

  const resetForm = () => {
    setSelectedFaq(null);
    setEditMode(false);
    setFormData({
      question: '',
      answer: '',
      is_active: true,
      position: 0
    });
  };

  return (
    <Row>
      <Col md={8}>
        <Card>
          <Card.Header>
            <h5 className="m-0">FAQs List</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Status</th>
                  <th>Position</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq.id}>
                    <td>{faq.question}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={faq.is_active}
                        onChange={() => handleToggleStatus(faq)}
                      />
                    </td>
                    <td>{faq.position}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(faq)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(faq.id)}
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
            <h5 className="m-0">{editMode ? 'Edit FAQ' : 'Add New FAQ'}</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Question</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Answer</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  required
                />
              </Form.Group>

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
                  {editMode ? 'Update FAQ' : 'Add FAQ'}
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

export default FAQManager; 