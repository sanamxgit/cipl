import React, { useState } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/backend/api/admin-auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'admin-login',
          ...formData
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.status === 'success' && data.user.role === 'admin') {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(from);
      } else {
        setError('Invalid admin credentials');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed');
    }
  };

  return (
    <Container className="admin-login-container">
      <Card className="admin-login-card">
        <Card.Body>
          <div className="text-center mb-4">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="admin-login-logo"
            />
            <h2 className="mt-3">Admin Login</h2>
          </div>

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminLogin; 