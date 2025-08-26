import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './FAQSection.css';

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/faqs.php');
        if (response.data.status === 'success') {
          setFaqs(response.data.data.filter(faq => faq.is_active));
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="container">
        <h2>FAQs</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={faq.id} 
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <button 
                className="faq-question" 
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                <span className="faq-icon">
                  <i className={`fas fa-chevron-${openIndex === index ? 'up' : 'down'}`}></i>
                </span>
              </button>
              <div className="faq-answer">
                <div className="faq-answer-content">
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

export default FAQSection; 