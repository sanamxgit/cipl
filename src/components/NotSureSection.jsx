import React from 'react';
import './NotSureSection.css';

const NotSureSection = () => {
  return (
    <section className="not-sure-section">
      <div className="container">
        <div className="not-sure-content">
          <div className="not-sure-text">
            <h2>Not sure of the right plan for you?</h2>
            <p>We have a great team here at CIPL waiting to help you with anything.</p>
            <a href="/quote" className="quote-button">
              Get a Quote
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          <div className="not-sure-decoration">
            <div className="circle-1"></div>
            <div className="circle-2"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotSureSection; 