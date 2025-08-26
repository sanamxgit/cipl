import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, logout, getUser, isAdmin } from '../utils/auth';
import { Link } from 'react-router-dom';
import './Navigation.css';
import Login from './Login';
import ContactModal from './ContactModal';
import QuotationModal from './QuotationModal';

const Navigation = ({ microsoftLogo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(() => {
    // Check localStorage on initial load
    return getUser();
  });

  const isProductView = location.pathname.startsWith('/products/');

  const handleLogin = (userData) => {
    setUser(userData);
    login(userData); // Use the new auth utility
    if (userData.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    setUser(null);
    logout(); // Use the new auth utility
    navigate('/'); // Redirect to home page
  };

  const isUserAdmin = () => {
    return user && user.role === 'admin';
  };

  const handleShowLogin = (signup = false) => {
    setIsSignUp(signup);
    setShowLogin(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAdobeClick = () => {
    // Set flag for BrandScroller to auto-select Adobe brand
    sessionStorage.setItem('selectAdobeBrand', 'true');
    navigate('/');
    // Scroll to brand section after navigation and auto-select Adobe
    setTimeout(() => {
      const brandSection = document.querySelector('.products-section');
      if (brandSection) {
        brandSection.scrollIntoView({ behavior: 'smooth' });
        // Auto-select Adobe brand (assuming it's the first brand or has a specific ID)
        // This will need to be implemented in the BrandScroller component
      }
    }, 100);
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
              <NavDropdown.Item onClick={() => handleAdobeClick()}>Adobe</NavDropdown.Item>
              <NavDropdown.Item href="/search?q=a">All Products</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown 
              title="Services" 
              id="services-dropdown"
              className="me-3"
            >
              <NavDropdown.Item onClick={() => setShowQuotationModal(true)}>Get the Quotation</NavDropdown.Item>
              <NavDropdown.Item href="/search?q=a">Browse Services</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          {/* Center-aligned items */}
          <Nav className="mx-auto custom-nav">
            <Nav.Link href="/" className="mx-2">Home</Nav.Link>
            <Nav.Link 
              onClick={() => setShowContactModal(true)} 
              className="mx-2 contact-us-link" 
              style={{ cursor: 'pointer' }}
            >
              Contact Us
            </Nav.Link>
          </Nav>

          {/* Right-aligned items */}
          <Nav className="ms-auto align-items-center">
            <Form className="d-flex me-3" onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <Button 
                type="submit" 
                variant="outline-secondary" 
                size="sm"
                className="search-submit-btn"
                onClick={handleSearch}
              >
                <i className="fas fa-search"></i>
              </Button>
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
                <NavDropdown.Item as={Link} to="/admin">Admin Dashboard</NavDropdown.Item>
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
      <ContactModal 
        show={showContactModal} 
        onHide={() => setShowContactModal(false)}
      />
      <QuotationModal 
        show={showQuotationModal} 
        onHide={() => setShowQuotationModal(false)}
        productType="General"
      />
    </Navbar>
  );
};

export default Navigation; 