import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const VideoManager = () => {
  const [videoData, setVideoData] = useState({
    title: '',
    subtitle: '',
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
        setVideoData({
          title: response.data.data.title || '',
          subtitle: response.data.data.subtitle || '',
          videoUrl: response.data.data.videoUrl || '',
          posterImage: response.data.data.posterImage || '',
          buttonText: response.data.data.buttonText || 'Add to Cart'
        });
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        id: 1,
        title: videoData.title || '',
        subtitle: videoData.subtitle || '',
        videoUrl: videoData.videoUrl || '',
        posterImage: videoData.posterImage || '',
        buttonText: videoData.buttonText || 'Add to Cart'
      };

      console.log('Sending data:', formData);

      const response = await axios({
        method: 'PUT',
        url: '/backend/api/video-section.php',
        data: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);

      if (response.data.status === 'success') {
        alert('Video section updated successfully!');
        await fetchVideoData();
      } else {
        throw new Error(response.data.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error updating video section:', error);
      alert(error.response?.data?.message || error.message || 'Failed to update video section');
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="m-0">Edit Video Section</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={videoData.title || ''}
              onChange={(e) => setVideoData({...videoData, title: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Subtitle</Form.Label>
            <Form.Control
              as="textarea"
              value={videoData.subtitle || ''}
              onChange={(e) => setVideoData({...videoData, subtitle: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Video URL</Form.Label>
            <Form.Control
              type="text"
              value={videoData.videoUrl || ''}
              onChange={(e) => setVideoData({...videoData, videoUrl: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Poster Image URL</Form.Label>
            <Form.Control
              type="text"
              value={videoData.posterImage || ''}
              onChange={(e) => setVideoData({...videoData, posterImage: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Button Text</Form.Label>
            <Form.Control
              type="text"
              value={videoData.buttonText || ''}
              onChange={(e) => setVideoData({...videoData, buttonText: e.target.value})}
            />
          </Form.Group>

          <Button type="submit" variant="primary">
            Update Video Section
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default VideoManager; 