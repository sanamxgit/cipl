import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../styles/VideoSection.css';

const VideoSection = () => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState({
    title: 'Design and make anything with Autodesk software',
    subtitle: 'Browse more products from Autodesk',
    videoUrl: '',
    posterImage: '',
    buttonText: 'Add to Cart'
  });

  useEffect(() => {
    fetchVideoData();
  }, []);

  const fetchVideoData = async () => {
    try {
      const response = await axios.get('/backend/api/video-section.php');
      if (response.data.status === 'success' && response.data.data) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          videoRef.current?.play();
        }
      },
      {
        threshold: 0.3
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={sectionRef} 
      className={`video-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="content-wrapper">
        <h1 className="title">{data.title}</h1>
        <p className="subtitle">{data.subtitle}</p>
        <button className="add-to-cart-btn">
          {data.buttonText}
          <span className="arrow">→</span>
        </button>
        <div className="video-container">
          {data.videoUrl && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              poster={data.posterImage}
              className="feature-video"
            >
              <source src={data.videoUrl} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSection; 