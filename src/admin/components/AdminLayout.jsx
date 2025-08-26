import React, { useState } from 'react';
import { Container, Nav, Navbar, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminLayout.css';
import AutodeskManager from '../pages/AutodeskManager';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded);
    window.dispatchEvent(new Event('resize'));
  };

  return (
    <div className="admin-wrapper">
      {/* Left Sidebar */}
      <div className={`admin-sidebar ${isMenuExpanded ? 'expanded' : 'collapsed'}`}>
        {/* Top Section */}
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="company-logo" 
              style={{ height: '40px', width: 'auto' }}
            />
            <button className="toggle-menu" onClick={toggleMenu}>
              <i className={`fas fa-${isMenuExpanded ? 'chevron-left' : 'chevron-right'}`}></i>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="sidebar-content">
          <Nav className="flex-column">
            <Link 
              to="/admin" 
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
            >
              <div className="nav-link-content">
                <img src="/icon-dashboard.png" alt="" className="nav-icon" />
                <span>Dashboard</span>
              </div>
            </Link>

            <Link 
              to="/admin/products" 
              className={`nav-link ${isActive('/admin/products') ? 'active' : ''}`}
            >
              <div className="nav-link-content">
                <img src="/icon-products.png" alt="" className="nav-icon" />
                <span>Products</span>
              </div>
            </Link>

            <Dropdown>
              <Dropdown.Toggle 
                className={`nav-link ${isActive('/admin/store') ? 'active' : ''}`}
              >
                <div className="nav-link-content">
                  <img src="/icon-store.png" alt="" className="nav-icon" />
                  <span>Store</span>
                </div>
                <i className="fas fa-angle-down dropdown-arrow"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item 
                  as={Link} 
                  to="/admin/carousels"
                  className={isActive('/admin/carousels') ? 'active' : ''}
                >
                  Carousels
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/brands">Brands</Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/products">Products</Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/video">Video Section</Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/featured">Featured Products</Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/image-grid">Image Grid</Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/trusted-leaders">Trusted Leaders</Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/faqs">FAQs</Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/footer">Footer Content</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown>
              <Dropdown.Toggle 
                className={`nav-link ${isActive('/admin/product-page') ? 'active' : ''}`}
              >
                <div className="nav-link-content">
                  <img src="/icon-products-page.png" alt="" className="nav-icon" />
                  <span>Product Page</span>
                </div>
                <i className="fas fa-angle-down dropdown-arrow"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item 
                  as={Link} 
                  to="/admin/microsoft-office"
                  className={isActive('/admin/microsoft-office') ? 'active' : ''}
                >
                  Microsoft Office
                </Dropdown.Item>
                <Dropdown.Item 
                  as={Link} 
                  to="/admin/autodesk"
                  className={isActive('/admin/autodesk') ? 'active' : ''}
                >
                  Autodesk
                </Dropdown.Item>
                {/* Add more product pages here as needed */}
              </Dropdown.Menu>
            </Dropdown>

            <Link 
              to="/admin/help" 
              className={`nav-link ${isActive('/admin/help') ? 'active' : ''}`}
            >
              <div className="nav-link-content">
                <img src="/icon-help.png" alt="" className="nav-icon" />
                <span>Help & Support</span>
              </div>
            </Link>

            <Link 
              to="/admin/contact-info" 
              className={`nav-link ${isActive('/admin/contact-info') ? 'active' : ''}`}
            >
              <div className="nav-link-content">
                <i className="fas fa-phone nav-icon" style={{ fontSize: '20px' }}></i>
                <span>Contact Info</span>
              </div>
            </Link>

            <Link 
              to="/admin/settings" 
              className={`nav-link ${isActive('/admin/settings') ? 'active' : ''}`}
            >
              <div className="nav-link-content">
                <img src="/icon-settings.png" alt="" className="nav-icon" />
                <span>Settings</span>
              </div>
            </Link>

          </Nav>
        </div>

        {/* Admin Profile at Bottom */}
        <div className="sidebar-footer">
          <div className="admin-profile">
            <img src="/admin-avatar.png" alt="Admin" />
            <div className="admin-info">
              <span className="admin-name">Olivia Williams</span>
              <span className="admin-role">Administrator</span>
            </div>
            <button className="profile-menu">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${isMenuExpanded ? '' : 'expanded'}`}>
        <div className="admin-content">
          {children}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLayout; 