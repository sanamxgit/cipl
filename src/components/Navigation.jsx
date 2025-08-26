import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../utils/auth';
import { Link } from 'react-router-dom';
import './Navigation.css';
import Login from './Login';

const Navigation = ({ microsoftLogo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(() => {
    // Check localStorage on initial load
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isProductView = location.pathname.startsWith('/products/');

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Clear user data from localStorage
    navigate('/'); // Redirect to home page
  };

  const handleShowLogin = (signup = false) => {
    setIsSignUp(signup);
    setShowLogin(true);
  };

  return (
    <Navbar bg="light" expand="lg" className="py-3">
      <Container>
        <div className="d-flex align-items-center">
          <Navbar.Brand as={Link} to="/">
            <img
              src="/images/logo.png"
              alt="Cyber International"
              height="40"
            />
          </Navbar.Brand>
          
          {isProductView && microsoftLogo && (
            <>
              <div className="mx-3" style={{ 
                height: '24px', 
                width: '1px', 
                backgroundColor: '#dee2e6' 
              }}></div>
              <img 
                src={microsoftLogo} 
                alt="Microsoft" 
                style={{ 
                  height: '30px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </>
          )}
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Left-aligned items */}
          <Nav className="me-auto custom-nav">
            <NavDropdown 
              title="Products" 
              id="products-dropdown"
              className={`me-3 ${!isProductView && location.pathname === '/products' ? 'active' : ''}`}
            >
              <NavDropdown.Item as={Link} to="/products/microsoft">Microsoft</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products/autodesk">Autodesk</NavDropdown.Item>
              <NavDropdown.Item href="/products">All Products</NavDropdown.Item>
              <NavDropdown.Item href="/products/adobe">Adobe Products</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown 
              title="Services" 
              id="services-dropdown"
              className="me-3"
            >
              <NavDropdown.Item href="/services/consulting">Consulting</NavDropdown.Item>
              <NavDropdown.Item href="/services/support">Support</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          {/* Center-aligned items */}
          <Nav className="mx-auto custom-nav">
            <Nav.Link href="/" className="mx-2">Home</Nav.Link>
            <Nav.Link href="/blog" className="mx-2">Blog</Nav.Link>
            <Nav.Link href="/contacts" className="mx-2">Contacts</Nav.Link>
          </Nav>

          {/* Right-aligned items */}
          <Nav className="ms-auto align-items-center">
            <Form className="d-flex me-3">
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
              />
            </Form>
            {!user ? (
              <div className="d-flex align-items-center">
                <Button 
                  variant="outline-primary" 
                  className="me-2 nav-btn"
                  onClick={() => handleShowLogin(false)}
                >
                  Login
                </Button>
                <Button 
                  variant="primary"
                  className="nav-btn"
                  onClick={() => handleShowLogin(true)}
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <NavDropdown 
                title={
                  <div className="d-inline-flex align-items-center">
                    <div className="user-avatar me-2">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="rounded-circle" width="32" />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    <span className="user-name">{user.name || 'User'}</span>
                  </div>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/account">Account Settings</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      <Login 
        show={showLogin} 
        onHide={() => setShowLogin(false)}
        onLogin={handleLogin}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
      />
    </Navbar>
  );
};

export default Navigation; 