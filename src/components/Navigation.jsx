import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../utils/auth';

const Navigation = ({ microsoftLogo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isProductView = location.pathname.startsWith('/products/');

  const handleLogin = () => {
    login();
    navigate('/admin');
  };

  return (
    <Navbar bg="light" expand="lg" className="py-3">
      <Container>
        <div className="d-flex align-items-center">
          <Navbar.Brand href="/" className="me-3">
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              Cyber International
            </span>
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
          <Nav className="me-auto">
            <NavDropdown 
              title="Products" 
              id="products-dropdown"
              className={`me-3 ${!isProductView && location.pathname === '/products' ? 'active' : ''}`}
            >
              <NavDropdown.Item href="/products">All Products</NavDropdown.Item>
              <NavDropdown.Item href="/products/microsoft">Microsoft Products</NavDropdown.Item>
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
          <Nav className="mx-auto">
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
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-primary" 
                className="me-2"
                onClick={handleLogin}
              >
                Login
              </Button>
              <Button 
                variant="primary"
                style={{ minWidth: '120px' }}
              >
                Get Started
              </Button>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 