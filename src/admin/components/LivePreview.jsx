import React from 'react';

const LivePreview = ({ formData }) => {
  return (
    <div className="live-preview">
      {/* Banner Preview */}
      <div 
        className="preview-banner"
        style={{
          backgroundImage: `url(${formData.banner_image})`,
          height: '200px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          padding: '1rem'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {formData.title || 'Get Microsoft Office 365 today'}
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            {formData.subtitle}
          </p>
        </div>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1
          }}
        />
      </div>

      {/* Plans Preview */}
      <div style={{ padding: '1rem' }}>
        <h4>Business Plans</h4>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0' }}>
          {formData.plans?.business?.cards?.map((card, index) => (
            <div 
              key={index}
              style={{
                minWidth: '200px',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            >
              <h5>{card.title}</h5>
              <p>${card.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LivePreview; 