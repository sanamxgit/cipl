import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Footer.css';

const Footer = () => {
  const [footerContent, setFooterContent] = useState({
    description: '',
    partners: [],
    company: [],
    social: [],
  });

  useEffect(() => {
    const fetchFooterContent = async () => {
      try {
        const response = await api.get('/footer-content.php');
        if (response.data.status === 'success') {
          const content = response.data.data;
          
          // Organize content by sections
          const organized = content.reduce((acc, item) => {
            if (item.section === 'description') {
              acc.description = item.content;
            } else {
              if (!acc[item.section]) {
                acc[item.section] = [];
              }
              if (item.is_active) {
                acc[item.section].push(item);
              }
            }
            return acc;
          }, { description: '', partners: [], company: [], social: [] });

          setFooterContent(organized);
        }
      } catch (error) {
        console.error('Error fetching footer content:', error);
      }
    };

    fetchFooterContent();
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Logo and Description Column */}
          <div className="footer-column logo-column">
            <Link to="/" className="footer-logo">
              <img src="/images/logo.png" alt="Logo" />
            </Link>
            <p className="company-description">
              {footerContent.description}
            </p>
          </div>

          {/* Partners Column */}
          <div className="footer-column">
            <h3>Partners</h3>
            <ul>
              {footerContent.partners.map((item) => (
                <li key={item.id}>
                  <a href={item.link_url}>{item.link_text}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              {footerContent.company.map((item) => (
                <li key={item.id}>
                  <a href={item.link_url}>{item.link_text}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Column */}
          <div className="footer-column">
            <h3>Social</h3>
            <ul>
              {footerContent.social.map((item) => (
                <li key={item.id}>
                  <a href={item.link_url} target="_blank" rel="noopener noreferrer">
                    {item.link_text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Buttons */}
          <div className="footer-column contact-column">
            <div className="contact-buttons">
              <a href="/contact/sales" className="contact-button sales">
                Contact Sales
                <i className="fas fa-arrow-right"></i>
              </a>
              <a href="/contact/support" className="contact-button support">
                Contact Support
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 