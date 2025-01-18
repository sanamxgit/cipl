import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import './Login.css';

const Login = ({ show, onHide, onLogin, isSignUp, setIsSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/backend/api/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isSignUp ? 'register' : 'login',
          ...formData
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        onLogin(data.user);
        onHide();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="auth-modal">
      <Modal.Header closeButton>
        <Modal.Title>{isSignUp ? 'Sign Up' : 'Login'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        <Form onSubmit={handleSubmit}>
          {isSignUp && (
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required={isSignUp}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
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

          {isSignUp && (
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </Form.Group>
          )}

          <Button variant="primary" type="submit" className="w-100 mb-3">
            {isSignUp ? 'Sign Up' : 'Login'}
          </Button>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Login; 