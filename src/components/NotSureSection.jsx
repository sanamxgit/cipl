import React, { useState } from 'react';
import QuotationModal from './QuotationModal'; // Ensure this is the correct path to your QuotationModal component
import './NotSureSection.css';

const NotSureSection = () => {
  const [showQuotation, setShowQuotation] = useState(false);

  return (
    <section className="not-sure-section">
      <div className="container">
        <div className="not-sure-content">
          <div className="not-sure-text">
            <h2>Not sure of the right plan for you?</h2>
            <p>We have a great team here at CIPL waiting to help you with anything.</p>
            <button
              className="quote-button"
              onClick={() => setShowQuotation(true)}
            >
              Get a Quote
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="not-sure-decoration">
            <div className="circle-1"></div>
            <div className="circle-2"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      {/* Quotation Modal */}
      <QuotationModal
        show={showQuotation}
        onHide={() => setShowQuotation(false)}
        selectedProduct={null} // Replace with appropriate product if needed
        productType="Autodesk"
      />
    </section>
  );
};

export default NotSureSection;
