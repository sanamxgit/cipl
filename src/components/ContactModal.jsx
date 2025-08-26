import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import './ContactModal.css';

const ContactModal = ({ show, onHide }) => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      fetchContactInfo();
    }
  }, [show]);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/contact-info.php');
      if (response.data.status === 'success') {
        setContactInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Set default values if API fails
      setContactInfo({
        phone_number: '+977-980000000',
        email: 'service@cipl.com',
        chat_title: 'Chat Now',
        chat_description: 'Chat with our support team for quick answers on product features, pricing and more.',
        call_title: 'Call Us',
        call_description: 'Call Our Award Winning Support 24/7'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCallClick = () => {
    if (contactInfo?.phone_number) {
      window.open(`tel:${contactInfo.phone_number}`, '_self');
    }
  };

  const handleEmailClick = () => {
    if (contactInfo?.email) {
      window.open(`mailto:${contactInfo.email}`, '_self');
    }
  };

  const handleChatClick = () => {
    // This could be integrated with a chat service like Intercom, Zendesk, etc.
    alert('Chat feature will be integrated soon!');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="contact-modal">
      <Modal.Header closeButton>
        <Modal.Title>Contact Us</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : contactInfo ? (
          <div className="contact-content">
            {/* Call Section */}
            <div className="contact-section">
              <div className="contact-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div className="contact-details">
                <h5>{contactInfo.call_title}</h5>
                <p className="contact-description">{contactInfo.call_description}</p>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleCallClick}
                  className="contact-button"
                >
                  <i className="fas fa-phone me-2"></i>
                  {contactInfo.phone_number}
                </Button>
              </div>
            </div>

            <hr className="contact-divider" />

            {/* Chat Section */}
            <div className="contact-section">
              <div className="contact-icon">
                <i className="fas fa-comments"></i>
              </div>
              <div className="contact-details">
                <h5>{contactInfo.chat_title}</h5>
                <p className="contact-description">{contactInfo.chat_description}</p>
                <Button 
                  variant="outline-primary" 
                  size="lg" 
                  onClick={handleChatClick}
                  className="contact-button"
                >
                  <i className="fas fa-comments me-2"></i>
                  Start Chat
                </Button>
              </div>
            </div>

            <hr className="contact-divider" />

            {/* Email Section */}
            <div className="contact-section">
              <div className="contact-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="contact-details">
                <h5>Email Us</h5>
                <p className="contact-description">
                  For further queries, mail us at: <strong>{contactInfo.email}</strong>
                </p>
                <Button 
                  variant="outline-secondary" 
                  size="lg" 
                  onClick={handleEmailClick}
                  className="contact-button"
                >
                  <i className="fas fa-envelope me-2"></i>
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">Unable to load contact information</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContactModal;
