import React from 'react';
import './Preview.css';

const Preview = ({ children }) => {
  return (
    <div className="preview-container">
      {children}
    </div>
  );
};

export default Preview; 