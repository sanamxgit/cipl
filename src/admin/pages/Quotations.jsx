import React, { useState, useEffect } from 'react';
import { Table, Badge, Dropdown } from 'react-bootstrap';
import api from '../../utils/api';
import './Quotations.css';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

    if (quote.status === 'done') {
      return (
        <Badge bg="success" className="status-badge">
          Done
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
            onClick={() => handleStatusChange(quote.id, 'done')}
          >
            Mark as Done
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
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
            <th>Customers Name</th>
            <th>Product Name</th>
            <th>Status</th>
            <th>Quotation Date</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((quote, index) => (
            <tr key={quote.id}>
              <td>{index + 1}</td>
              <td>#{String(quote.id).padStart(4, '0')}</td>
              <td>{quote.email}</td>
              <td>{quote.full_name}</td>
              <td>{quote.product_name}</td>
              <td>
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
    </div>
  );
};

export default Quotations; 