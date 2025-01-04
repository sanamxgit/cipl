import React, { useEffect, useRef } from 'react';

const MicrosoftVideoSection = ({ videos }) => {
  const videoRefs = useRef([]);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const videoElement = entry.target.querySelector('video');
          const card = entry.target;
          
          card.classList.add('visible');
          
          if (videoElement) {
            if (!videoElement.src) {
              const videoData = videos[parseInt(entry.target.dataset.index)];
              videoElement.src = videoData.video_url;
            }
            
            videoElement.load();
            const playPromise = videoElement.play();
            
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.log('Video autoplay prevented:', error);
              });
            }
            card.classList.add('playing');
          }
        } else {
          const videoElement = entry.target.querySelector('video');
          const card = entry.target;
          
          if (videoElement) {
            videoElement.pause();
            card.classList.remove('playing');
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px'
    });

    videoRefs.current.forEach(ref => {
      if (ref) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videos]);

  return (
    <div className="ms-video-section">
      <div className="ms-video-container">
        <div className="ms-video-row">
          {videos?.map((video, index) => (
            <div
              key={video.id}
              className="ms-video-card"
              ref={el => videoRefs.current[index] = el}
              data-index={index}
            >
              <div className="ms-video-wrapper">
                <img
                  className="ms-video-thumbnail"
                  src={video.thumbnail_url}
                  alt={video.title}
                  loading="lazy"
                />
                <video
                  className="ms-video-player"
                  playsInline
                  muted
                  loop
                  preload="metadata"
                  onError={(e) => console.error('Video error:', e)}
                />
              </div>
              <div className="ms-video-content">
                <h3 className="ms-video-title">{video.title}</h3>
                <p className="ms-video-description">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MicrosoftVideoSection; 