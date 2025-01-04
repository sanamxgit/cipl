import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MicrosoftOffice.css';

const MicrosoftOffice = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/backend/api/microsoft-office.php');
      console.log('Full API response:', response.data);

      if (response.data.status === 'success') {
        setPageData(response.data.data);
      } else {
        setError('Response status was not success');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="microsoft-office-view">
      <div className="ms-video-section">
        <div className="ms-video-container">
          <div className="ms-video-row">
            {pageData?.videos?.map((video) => (
              <div key={video.id} className="ms-video-card visible">
                <div className="ms-video-wrapper">
                  {video.thumbnail_url && (
                    <img
                      className="ms-video-thumbnail"
                      src={video.thumbnail_url}
                      alt={video.title}
                      onError={(e) => console.error('Thumbnail load error:', e)}
                    />
                  )}
                  {video.video_url && (
                    <video
                      className="ms-video-player"
                      src={video.video_url}
                      playsInline
                      muted
                      loop
                      autoPlay
                      controls
                      onError={(e) => console.error('Video load error:', e)}
                    />
                  )}
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
    </div>
  );
};

export default MicrosoftOffice; 