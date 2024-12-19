import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

const Navigation = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="/">
          <img src="/logo.png" alt="Cyber International" height="40" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown title="Products" id="products-dropdown">
              <NavDropdown.Item href="/products/office">Microsoft Office</NavDropdown.Item>
              <NavDropdown.Item href="/products/other">Other Products</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="/services">Services</Nav.Link>
            <Nav.Link href="/home">Home</Nav.Link>
            <Nav.Link href="/blog">Blog</Nav.Link>
            <Nav.Link href="/contacts">Contacts</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 