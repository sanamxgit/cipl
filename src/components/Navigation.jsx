import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';

const Navigation = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate('/admin');
  };

  return (
    <Navbar bg="light" expand="lg" className="py-3">
      <Container>
        <Navbar.Brand href="/" className="me-4">
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Cyber International
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Left-aligned items */}
          <Nav className="me-auto">
            <NavDropdown 
              title="Products" 
              id="products-dropdown"
              className="me-3"
            >
              <NavDropdown.Item href="/products/office">Microsoft Office</NavDropdown.Item>
              <NavDropdown.Item href="/products/other">Other Products</NavDropdown.Item>
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
            <Nav.Link href="/home" className="mx-2">Home</Nav.Link>
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
            <Button 
              variant="outline-primary" 
              className="me-2"
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button variant="primary">Get Started</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 