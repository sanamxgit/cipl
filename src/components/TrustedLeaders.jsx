import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TrustedLeaders.css';

const TrustedLeaders = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await axios.get('/backend/api/trusted-leaders.php');
        if (response.data.status === 'success') {
          setLeaders(response.data.data.filter(leader => leader.is_active));
        }
      } catch (error) {
        console.error('Error fetching trusted leaders:', error);
      }
    };

    fetchLeaders();
  }, []);

  // Only render if we have leaders
  if (leaders.length === 0) return null;

  // Calculate how many copies we need for smooth scrolling
  const copies = Math.ceil(window.innerWidth / (160 + 40)) + 1; // logo width + gap

  return (
    <section className="trusted-leaders">
      <div className="container">
        <h2>Trusted by Industry Leaders</h2>
        <div className="leaders-scroll">
          <div className="leaders-track">
            {/* Repeat the array enough times to fill the screen */}
            {Array(copies).fill(leaders).flat().map((leader, index) => (
              <div key={`${leader.id}-${index}`} className="leader-item">
                <img 
                  src={leader.logo_url} 
                  alt={leader.name}
                  loading="lazy" // Add lazy loading
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedLeaders; 