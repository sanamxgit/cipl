import React, { useRef, useEffect, useState } from 'react';
import './MicrosoftVideoSection.css';

const MicrosoftVideoSection = ({ videoData }) => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Debug log when component mounts or videoData changes
    console.log('MicrosoftVideoSection received data:', videoData);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.log('Video play error:', error);
              });
            }
          }
        } else {
          setIsVisible(false);
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [videoData]);

  // Early return if no video URL
  if (!videoData?.video_url) {
    console.log('No video URL provided, not rendering video section');
    return null;
  }

  return (
    <div className="ms-video-section" ref={sectionRef}>
      <div className="ms-video-inner">
        <div className="ms-video-content">
          <h2>{videoData.video_title || 'Microsoft Office'}</h2>
          <p>{videoData.video_description || 'Watch our video'}</p>
        </div>
        <div className="ms-video-wrapper">
          <video
            ref={videoRef}
            className="ms-video-player"
            src={videoData.video_url}
            controls
            playsInline
            muted
            loop
            onError={(e) => console.error('Video error:', e)}
            onLoadStart={() => console.log('Video load started')}
            onLoadedData={() => console.log('Video loaded successfully')}
          >
            <source src={videoData.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default MicrosoftVideoSection; 