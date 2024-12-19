import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <Nav className="bg-dark p-3 text-white">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="m-0">Admin Panel</h4>
            <div className="d-flex gap-3">
              <Link 
                to="/admin" 
                className={`btn ${location.pathname === '/admin' ? 'btn-primary' : 'btn-outline-light'}`}
              >
                Carousels
              </Link>
              <Link 
                to="/admin/brands" 
                className={`btn ${location.pathname === '/admin/brands' ? 'btn-primary' : 'btn-outline-light'}`}
              >
                Brands
              </Link>
              <Link 
                to="/admin/products" 
                className={`btn ${location.pathname === '/admin/products' ? 'btn-primary' : 'btn-outline-light'}`}
              >
                Products
              </Link>
              <Link to="/" className="btn btn-outline-light">Back to Site</Link>
            </div>
          </div>
        </Container>
      </Nav>
      <Container fluid className="py-4">
        {children}
      </Container>
    </div>
  );
};

export default AdminLayout; 