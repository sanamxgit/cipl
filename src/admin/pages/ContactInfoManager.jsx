import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from '../../config/axios';
import './ContactInfoManager.css';

const ContactInfoManager = () => {
  const [contactInfo, setContactInfo] = useState({
    id: '',
    phone_number: '+977-980000000',
    email: 'service@cipl.com',
    chat_title: 'Chat Now',
    chat_description: 'Chat with our support team for quick answers on product features, pricing and more.',
    call_title: 'Call Us',
    call_description: 'Call Our Award Winning Support 24/7'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      console.log('Fetching contact info...');
      const response = await axios.get('/contact-info.php');
      console.log('Response:', response.data);
      if (response.data.status === 'success') {
        setContactInfo(response.data.data);
      } else {
        console.error('API returned error status:', response.data);
        setMessage({ type: 'danger', text: response.data.message || 'Failed to load contact information' });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setMessage({ type: 'danger', text: 'Failed to load contact information: ' + (error.message || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContactInfo = async () => {
    try {
      setSaving(true);
      const response = await axios.put('/contact-info.php', contactInfo);
      if (response.data.status === 'success') {
        setMessage({ type: 'success', text: 'Contact information updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      setMessage({ type: 'danger', text: 'Failed to update contact information' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading contact information...</p>
      </div>
    );
  }

  return (
    <div className="contact-info-manager">
      <div className="page-header">
        <h1>Contact Information </h1>
      </div>

      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="contact-form-card">
            
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={contactInfo.phone_number || ''}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      placeholder="+977-980000000"
                    />
                    <Form.Text className="text-muted">
                      This will be displayed in the contact modal and used for click-to-call functionality
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={contactInfo.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="service@cipl.com"
                    />
                    <Form.Text className="text-muted">
                      This will be displayed in the contact modal and used for click-to-email functionality
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Call Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={contactInfo.call_title || ''}
                      onChange={(e) => handleInputChange('call_title', e.target.value)}
                      placeholder="Call Us"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chat Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={contactInfo.chat_title || ''}
                      onChange={(e) => handleInputChange('chat_title', e.target.value)}
                      placeholder="Chat Now"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Call Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={contactInfo.call_description || ''}
                  onChange={(e) => handleInputChange('call_description', e.target.value)}
                  placeholder="Call Our Award Winning Support 24/7"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Chat Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={contactInfo.chat_description || ''}
                  onChange={(e) => handleInputChange('chat_description', e.target.value)}
                  placeholder="Chat with our support team for quick answers on product features, pricing and more."
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleUpdateContactInfo}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Contact Information'
                  )}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={fetchContactInfo}
                  disabled={saving}
                >
                  Reset to Saved
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="preview-card">
            <Card.Header>
              <h5 className="mb-0">Preview</h5>
            </Card.Header>
            <Card.Body>
              <div className="contact-preview">
                <div className="preview-section">
                  <div className="preview-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="preview-content">
                    <h6>{contactInfo.call_title || 'Call Us'}</h6>
                    <p className="preview-description">{contactInfo.call_description || 'Call Our Award Winning Support 24/7'}</p>
                    <div className="preview-phone">{contactInfo.phone_number || '+977-980000000'}</div>
                  </div>
                </div>

                <hr className="preview-divider" />

                <div className="preview-section">
                  <div className="preview-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="preview-content">
                    <h6>Email Us</h6>
                    <p className="preview-description">
                      For further queries, mail us at: <strong>{contactInfo.email || 'service@cipl.com'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContactInfoManager;
