import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './MicrosoftFAQSection.css';

const MicrosoftFAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/microsoft-faqs.php');
        if (response.data.status === 'success') {
          setFaqs(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching Microsoft FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section className="microsoft-faq-section">
        <div className="container">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null; // Don't render if no FAQs
  }

  return (
    <section className="microsoft-faq-section">
      <div className="container">
        <h2>Frequently Asked Questions</h2>
       
        <div className="microsoft-faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={faq.id} 
              className={`microsoft-faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <button 
                className="microsoft-faq-question" 
                onClick={() => toggleFaq(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <span className="microsoft-faq-question-text">{faq.question}</span>
                <span className="microsoft-faq-icon">
                  <i className={`fas fa-chevron-${openIndex === index ? 'up' : 'down'}`}></i>
                </span>
              </button>
              <div 
                className="microsoft-faq-answer"
                id={`faq-answer-${faq.id}`}
                aria-hidden={openIndex !== index}
              >
                <div className="microsoft-faq-answer-content">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MicrosoftFAQSection;
