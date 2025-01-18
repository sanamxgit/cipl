import React from 'react';
import './MicrosoftFeatures.css';

const MicrosoftFeatures = ({ features }) => {
  console.log('MicrosoftFeatures received:', features);

  if (!features || features.length === 0) {
    console.log('No features to display');
    return null;
  }

  return (
    <section className="ms-features-section">
      <div className="container">
        <h2 className="section-title">Microsoft 365 Features</h2>
        <div className="ms-features-grid">
          {features.map((feature) => {
            console.log('Rendering feature:', feature);
            return (
              <div key={feature.id} className="ms-feature-card">
                <div className="ms-feature-image">
                  {feature.image_url && (
                    <img src={feature.image_url} alt={feature.title} />
                  )}
                </div>
                <div className="ms-feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  {feature.link_url && (
                    <a href={feature.link_url} className="ms-feature-link">
                      Buy now <span>→</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MicrosoftFeatures; 