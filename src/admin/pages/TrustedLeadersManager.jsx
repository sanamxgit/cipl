import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table } from 'react-bootstrap';
import api from '../../utils/api';

const TrustedLeadersManager = () => {
  const [leaders, setLeaders] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const response = await api.get('/trusted-leaders.php');
      if (response.data.status === 'success') {
        setLeaders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaders:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/trusted-leaders.php${editMode ? `?id=${selectedLeader.id}` : ''}`;
      const method = editMode ? 'put' : 'post';
      
      const response = await api({
        method,
        url: endpoint,
        data: formData
      });

      if (response.data.status === 'success') {
        await fetchLeaders();
        resetForm();
        alert(editMode ? 'Leader updated successfully!' : 'Leader added successfully!');
      }
    } catch (error) {
      console.error('Error saving leader:', error);
      alert('Failed to save leader');
    }
  };

  const handleEdit = (leader) => {
    setSelectedLeader(leader);
    setFormData({
      name: leader.name,
      logo_url: leader.logo_url,
      is_active: leader.is_active
    });
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leader?')) {
      try {
        await api.delete(`/trusted-leaders.php?id=${id}`);
        await fetchLeaders();
      } catch (error) {
        console.error('Error deleting leader:', error);
        alert('Failed to delete leader');
      }
    }
  };

  const handleToggleStatus = async (leader) => {
    try {
      const response = await api.put(`/trusted-leaders.php?id=${leader.id}`, {
        ...leader,
        is_active: !leader.is_active
      });

      if (response.data.status === 'success') {
        setLeaders(leaders.map(l => 
          l.id === leader.id 
            ? { ...l, is_active: !l.is_active }
            : l
        ));
      }
    } catch (error) {
      console.error('Error toggling leader status:', error);
      alert('Failed to update leader status');
    }
  };

  const resetForm = () => {
    setSelectedLeader(null);
    setEditMode(false);
    setFormData({
      name: '',
      logo_url: '',
      is_active: true
    });
  };

  return (
    <Row>
      <Col md={8}>
        <Card>
          <Card.Header>
            <h5 className="m-0">Trusted Leaders List</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((leader) => (
                  <tr key={leader.id}>
                    <td>
                      <img 
                        src={leader.logo_url} 
                        alt={leader.name} 
                        style={{ height: '40px' }}
                      />
                    </td>
                    <td>{leader.name}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={leader.is_active}
                        onChange={() => handleToggleStatus(leader)}
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(leader)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(leader.id)}
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
            <h5 className="m-0">{editMode ? 'Edit Leader' : 'Add New Leader'}</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Logo URL</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
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
                  {editMode ? 'Update Leader' : 'Add Leader'}
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

export default TrustedLeadersManager; 