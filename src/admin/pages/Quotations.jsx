import React, { useState, useEffect } from 'react';
import { Table, Badge, Dropdown, Modal, Button } from 'react-bootstrap';
import api from '../../utils/api';
import './Quotations.css';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    fetchQuotations();
  }, []);
  
  const fetchQuotations = async () => {
    try {
      const response = await api.get('/quotations.php');
      if (response.data.status === 'success') {
        setQuotations(response.data.data.map(quote => ({
          ...quote,
          status: quote.status || 'pending'
        })));
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      console.log('Updating status:', { quotationId, newStatus }); // Debug log

      const response = await api.put('/quotations.php', {
        id: quotationId,
        status: newStatus
      });
      
      console.log('Update response:', response.data); // Debug log

      if (response.data.status === 'success') {
        // Refresh the entire quotations list to ensure we have the latest data
        await fetchQuotations();
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Refresh data to ensure UI shows correct state
      await fetchQuotations();
    }
  };

  const renderStatus = (quote) => {
    console.log('Rendering status for quote:', quote); // Debug log

    if (quote.status === 'completed') {
      return (
        <Badge bg="success" className="status-badge">
          Completed
        </Badge>
      );
    } else if (quote.status === 'contacted') {
      return (
        <Badge bg="info" className="status-badge">
          Contacted
        </Badge>
      );
    }

    return (
      <Dropdown>
        <Dropdown.Toggle 
          variant="warning" 
          size="sm"
          className="status-dropdown"
        >
          Pending
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item 
            onClick={() => handleStatusChange(quote.id, 'contacted')}
          >
            Mark as Contacted
          </Dropdown.Item>
          <Dropdown.Item 
            onClick={() => handleStatusChange(quote.id, 'completed')}
          >
            Mark as Completed
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const handleRowClick = (quotation) => {
    setSelectedQuotation(quotation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQuotation(null);
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="quotations-container">
      <h2 className="mb-4">Recent Quotations</h2>
      <Table responsive striped hover>
        <thead>
          <tr>
            <th>SN</th>
            <th>Customer ID</th>
            <th>Customer Email</th>
            <th>Phone Number</th>
            <th>Customers Name</th>
            <th>Product Name</th>
            <th>Status</th>
            <th>Quotation Date</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((quote, index) => (
            <tr 
              key={quote.id} 
              onClick={() => handleRowClick(quote)}
              style={{ cursor: 'pointer' }}
              className="quotation-row"
            >
              <td>{index + 1}</td>
              <td>#{String(quote.id).padStart(4, '0')}</td>
              <td>{quote.email}</td>
              <td>{quote.phone_number}</td>
              <td>{quote.full_name}</td>
              <td>{quote.product_name}</td>
              <td onClick={(e) => e.stopPropagation()}>
                {renderStatus(quote)}
              </td>
              <td>
                {new Date(quote.created_at).toLocaleDateString()} {' '}
                {new Date(quote.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Quotation Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Quotation Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuotation && (
            <div className="quotation-details">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted mb-2">Customer Information</h6>
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedQuotation.full_name}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedQuotation.email}
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong> {selectedQuotation.phone_number}
                  </div>
                  <div className="detail-item">
                    <strong>Company:</strong> {selectedQuotation.company_name || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Country:</strong> {selectedQuotation.country || 'N/A'}
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted mb-2">Product Information</h6>
                  <div className="detail-item">
                    <strong>Product Type:</strong> {selectedQuotation.product_type}
                  </div>
                  <div className="detail-item">
                    <strong>Product Name:</strong> {selectedQuotation.product_name}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> 
                    <span className="ms-2">
                      {selectedQuotation.status === 'completed' ? (
                        <Badge bg="success">Completed</Badge>
                      ) : selectedQuotation.status === 'contacted' ? (
                        <Badge bg="info">Contacted</Badge>
                      ) : (
                        <Badge bg="warning">Pending</Badge>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Quotation ID:</strong> #{String(selectedQuotation.id).padStart(4, '0')}
                  </div>
                  <div className="detail-item">
                    <strong>Created:</strong> {new Date(selectedQuotation.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {selectedQuotation.message && (
                <div className="mt-4">
                  <h6 className="text-muted mb-2">Additional Message</h6>
                  <div className="message-box p-3 bg-light rounded">
                    {selectedQuotation.message}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Quotations; 