import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Tab, Tabs } from 'react-bootstrap';
import axios from 'axios';

const formStyles = {
  input: {
    minWidth: '100%',
    marginBottom: '1rem'
  },
  textarea: {
    minWidth: '100%',
    minHeight: '100px',
    marginBottom: '1rem'
  },
  section: {
    padding: '1.5rem',
    border: '1px solid #dee2e6',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem'
  }
};

const MicrosoftOfficeManager = () => {
  const [formData, setFormData] = useState({
    title: 'Get started with Microsoft Office 365 today',
    subtitle: 'Collaborate, create, and achieve more with the world\'s leading productivity suite.',
    banner_image: '',
    isImageUrl: false,
    main_heading: 'Unlock productivity, creativity, and generative AI for your organization.',
    main_description: 'Microsoft 365 empowers your employees to do their best work with the power of generative AI in the apps they use daily.',
    floating_icons: [],
    plans: {
      home: {
        title: 'For Home',
        cards: [
          {
            costText: 'Boost Productivity at a Cost That Works for You',
            tag: 'Most Popular',
            title: 'Microsoft 365 Business Basic',
            sections: [
              {
                title: 'Manage Users with Ease',
                items: [
                  'Identity and access management for up to 300 employees',
                  'Custom business email (you@yourbusiness.com)'
                ],
                icons: ['/icons/user.png', '/icons/email.png']
              },
              {
                title: 'Office Tools on Web and Mobile',
                items: [
                  'Word, Excel, PowerPoint, and Outlook',
                  'Web and Mobile Apps Only: Work from anywhere with seamless web and mobile access'
                ],
                icons: ['/icons/office.png', '/icons/web.png', '/icons/mobile.png']
              },
              {
                title: 'Collaborate and Connect',
                items: [
                  'Chat, call, and video conference with Microsoft Teams',
                  '1 TB cloud storage per employee on OneDrive',
                  'Secure team communication with Teams, OneDrive, SharePoint, and Exchange'
                ],
                icons: ['/icons/teams.png', '/icons/cloud.png', '/icons/security.png']
              }
            ],
            primaryButton: 'Plans & Pricing',
            secondaryButton: 'Contact us'
          }
        ]
      },
      business: {
        title: 'For Business',
        cards: [
          {
            title: 'Microsoft 365 Business Basic',
            subtitle: 'For small businesses',
            tag: 'Best Value',
            features: [
              { text: 'Web and mobile versions of Office apps', icon: '/icons/office.png' },
              { text: 'Email and calendar', icon: '/icons/outlook.png' },
              { text: 'Teams for business', icon: '/icons/teams.png' },
              { text: 'File sharing and storage', icon: '/icons/cloud.png' }
            ],
            primaryButton: 'Plans & Pricing',
            secondaryButton: 'Contact us'
          }
        ]
      }
    },
    microsoftLogo: '/images/microsoft-logo.png'
  });

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    sort_order: 0
  });

  const [editingVideo, setEditingVideo] = useState(null);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const response = await axios.get('/backend/api/microsoft-office.php');
      if (response.data.status === 'success') {
        const data = response.data.data;
        setFormData({
          ...data,
          isImageUrl: Boolean(data.is_image_url)
        });
      }
    } catch (error) {
      console.error('Error fetching page data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saveButton = e.target.querySelector('button[type="submit"]');
    
    try {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        // Log the data being sent
        console.log('Sending data:', {
            ...formData,
            microsoftLogo: formData.microsoftLogo,
            partnerLogo: formData.partnerLogo
        });

        const response = await axios.post('/backend/api/microsoft-office.php', {
            ...formData,
            microsoftLogo: formData.microsoftLogo,
            partnerLogo: formData.partnerLogo
        });

        if (response.data.status === 'success') {
            alert('Changes saved successfully!');
            await fetchPageData();
        } else {
            throw new Error(response.data.message || 'Failed to save changes');
        }
    } catch (error) {
        console.error('Error saving:', error);
        console.error('Error response:', error.response?.data);
        alert(`Error saving changes: ${error.response?.data?.message || error.message}`);
    } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = 'Save Changes';
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/backend/api/upload.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setFormData(prev => ({
          ...prev,
          banner_image: response.data.file_url
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const updateCard = (planType, cardIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? { ...card, [field]: value } : card
          )
        }
      }
    }));
  };

  const updateFeature = (planType, cardIndex, featureIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              features: card.features.map((feature, fIndex) =>
                fIndex === featureIndex ? { ...feature, [field]: value } : feature
              )
            } : card
          )
        }
      }
    }));
  };

  const addFeature = (planType, cardIndex) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              features: [...card.features, { text: '', icon: '' }]
            } : card
          )
        }
      }
    }));
  };

  const removeFeature = (planType, cardIndex, featureIndex) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              features: card.features.filter((_, fIndex) => fIndex !== featureIndex)
            } : card
          )
        }
      }
    }));
  };

  const addCard = (planType) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: [
            ...prev.plans[planType].cards,
            {
              costText: 'Boost Productivity at a Cost That Works for You',
              tag: '',
              title: 'New Plan',
              sections: [
                {
                  title: 'New Section',
                  items: [],
                  icons: []
                }
              ],
              primaryButton: 'Plans & Pricing',
              secondaryButton: 'Contact us'
            }
          ]
        }
      }
    }));
  };

  const removeCard = (planType, cardIndex) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.filter((_, index) => index !== cardIndex)
        }
      }
    }));
  };

  const updateSection = (planType, cardIndex, sectionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              sections: card.sections.map((section, sIndex) =>
                sIndex === sectionIndex ? { ...section, [field]: value } : section
              )
            } : card
          )
        }
      }
    }));
  };

  const updateSectionItem = (planType, cardIndex, sectionIndex, itemIndex, value) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              sections: card.sections.map((section, sIndex) =>
                sIndex === sectionIndex ? {
                  ...section,
                  items: section.items.map((item, iIndex) =>
                    iIndex === itemIndex ? value : item
                  )
                } : section
              )
            } : card
          )
        }
      }
    }));
  };

  const updateSectionIcon = (planType, cardIndex, sectionIndex, iconIndex, value) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              sections: card.sections.map((section, sIndex) =>
                sIndex === sectionIndex ? {
                  ...section,
                  icons: section.icons.map((icon, iIndex) =>
                    iIndex === iconIndex ? value : icon
                  )
                } : section
              )
            } : card
          )
        }
      }
    }));
  };

  const addSection = (planType, cardIndex) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              sections: [
                ...card.sections,
                {
                  title: 'New Section',
                  items: [],
                  icons: []
                }
              ]
            } : card
          )
        }
      }
    }));
  };

  const addSectionItem = (planType, cardIndex, sectionIndex) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              sections: card.sections.map((section, sIndex) =>
                sIndex === sectionIndex ? {
                  ...section,
                  items: [...section.items, '']
                } : section
              )
            } : card
          )
        }
      }
    }));
  };

  const addSectionIcon = (planType, cardIndex, sectionIndex) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              sections: card.sections.map((section, sIndex) =>
                sIndex === sectionIndex ? {
                  ...section,
                  icons: [...section.icons, '']
                } : section
              )
            } : card
          )
        }
      }
    }));
  };

  const removeSectionItem = (planType, cardIndex, sectionIndex, itemIndex) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              sections: card.sections.map((section, sIndex) =>
                sIndex === sectionIndex ? {
                  ...section,
                  items: section.items.filter((_, iIndex) => iIndex !== itemIndex)
                } : section
              )
            } : card
          )
        }
      }
    }));
  };

  const removeSectionIcon = (planType, cardIndex, sectionIndex, iconIndex) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [planType]: {
          ...prev.plans[planType],
          cards: prev.plans[planType].cards.map((card, index) => 
            index === cardIndex ? {
              ...card,
              sections: card.sections.map((section, sIndex) =>
                sIndex === sectionIndex ? {
                  ...section,
                  icons: section.icons.filter((_, iIndex) => iIndex !== iconIndex)
                } : section
              )
            } : card
          )
        }
      }
    }));
  };

  const handleAddVideo = async () => {
    try {
      // Validate required fields
      if (!newVideo.title || !newVideo.video_url || !newVideo.thumbnail_url) {
        alert('Please fill in all required fields (title, video URL, and thumbnail URL)');
        return;
      }

      const response = await axios.post('/backend/api/microsoft-office.php', {
        action: 'add_video',
        title: newVideo.title,
        description: newVideo.description || '',
        video_url: newVideo.video_url,
        thumbnail_url: newVideo.thumbnail_url,
        sort_order: newVideo.sort_order || 0
      });

      if (response.data.status === 'success') {
        alert('Video added successfully!');
        setNewVideo({
          title: '',
          description: '',
          video_url: '',
          thumbnail_url: '',
          sort_order: 0
        });
        fetchPageData();
      }
    } catch (error) {
      console.error('Error adding video:', error);
      console.error('Error response:', error.response?.data);
      alert(`Error adding video: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditVideo = async (video) => {
    setEditingVideo(video);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.post('/backend/api/microsoft-office.php', {
        action: 'update_video',
        video_id: editingVideo.id,
        title: editingVideo.title,
        description: editingVideo.description,
        video_url: editingVideo.video_url,
        thumbnail_url: editingVideo.thumbnail_url,
        sort_order: editingVideo.sort_order || 0
      });

      if (response.data.status === 'success') {
        alert('Video updated successfully!');
        setEditingVideo(null);
        fetchPageData();
      }
    } catch (error) {
      console.error('Error updating video:', error);
      alert(`Error updating video: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        const response = await axios.post('/backend/api/microsoft-office.php', {
          action: 'delete_video',
          video_id: videoId
        });

        if (response.data.status === 'success') {
          alert('Video deleted successfully!');
          fetchPageData();
        }
      } catch (error) {
        console.error('Error deleting video:', error);
        alert(`Error deleting video: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Live Preview Panel
  const PreviewPanel = () => (
    <div className="preview-container" style={{ border: '1px solid #dee2e6', borderRadius: '4px' }}>
      <div className="product-category-view" style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
        <div className="hero-banner" style={{
          backgroundImage: formData.banner_image ? `url(${formData.banner_image})` : 'none'
        }}>
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h1>{formData.title}</h1>
            <p className="subtitle">{formData.subtitle}</p>
          </div>
          <div className="floating-icons">
            <div className="icon-container">
              <i className="fab fa-microsoft floating-icon icon1"></i>
              <i className="fas fa-file-word floating-icon icon2"></i>
              <i className="fas fa-file-excel floating-icon icon3"></i>
              <i className="fas fa-users floating-icon icon4"></i>
            </div>
          </div>
        </div>

        <div className="category-selector">
          <div className="container">
            <div className="category-buttons">
              {Object.entries(formData.plans).map(([key, plan]) => (
                <button
                  key={key}
                  className="category-btn"
                >
                  {plan.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container main-content">
          <div className="content-section">
            <h2>{formData.main_heading}</h2>
            <p className="description">{formData.main_description}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Row>
      <Col md={7}>
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Microsoft Office Page Settings</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Tabs defaultActiveKey="general" className="mb-4">
                <Tab eventKey="general" title="General">
                  <Form.Group className="mb-3">
                    <Form.Label>Banner Image</Form.Label>
                    <div className="mb-2">
                      <Form.Check
                        inline
                        type="radio"
                        name="imageSource"
                        label="Upload File"
                        id="upload-file"
                        checked={!formData.isImageUrl}
                        onChange={() => setFormData(prev => ({ ...prev, isImageUrl: false }))}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        name="imageSource"
                        label="Image URL"
                        id="image-url"
                        checked={formData.isImageUrl}
                        onChange={() => setFormData(prev => ({ ...prev, isImageUrl: true }))}
                      />
                    </div>

                    {formData.isImageUrl ? (
                      <Form.Control
                        type="text"
                        placeholder="Enter image URL"
                        value={formData.banner_image || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          banner_image: e.target.value
                        }))}
                      />
                    ) : (
                      <Form.Control
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    )}
                    
                    {formData.banner_image && (
                      <div className="mt-2">
                        <img 
                          src={formData.banner_image}
                          alt="Banner preview"
                          className="mt-2"
                          style={{ maxWidth: '100%', height: '100px', objectFit: 'cover' }}
                        />
                        <Button 
                          variant="link" 
                          className="p-0 ms-2 text-danger"
                          onClick={() => setFormData(prev => ({ ...prev, banner_image: '' }))}
                        >
                          <i className="fas fa-times"></i> Remove
                        </Button>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Page Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Subtitle</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Main Heading</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.main_heading}
                      onChange={(e) => setFormData({...formData, main_heading: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Main Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.main_description}
                      onChange={(e) => setFormData({...formData, main_description: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Microsoft Logo</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.microsoftLogo}
                      style={formStyles.input}
                      onChange={(e) => setFormData({...formData, microsoftLogo: e.target.value})}
                    />
                    {formData.microsoftLogo && (
                      <img 
                        src={formData.microsoftLogo} 
                        alt="Microsoft Logo" 
                        style={{ height: '40px', marginTop: '10px', width: 'auto' }} 
                      />
                    )}
                  </Form.Group>
                </Tab>

                <Tab eventKey="plans" title="Plans">
                  {['home', 'business'].map(planType => (
                    <div key={planType} className="mb-5">
                      <h5 className="text-capitalize mb-3">{planType} Plans</h5>
                      
                      {formData.plans[planType].cards.map((card, cardIndex) => (
                        <Card key={cardIndex} className="mb-4">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6>Card {cardIndex + 1}</h6>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => removeCard(planType, cardIndex)}
                              >
                                Remove Card
                              </Button>
                            </div>

                            <Form.Group className="mb-3">
                              <Form.Label>Cost Text</Form.Label>
                              <Form.Control
                                type="text"
                                value={card.costText || ''}
                                style={formStyles.input}
                                placeholder="e.g., Boost Productivity at a Cost That Works for You"
                                onChange={(e) => updateCard(planType, cardIndex, 'costText', e.target.value)}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>Tag</Form.Label>
                              <Form.Control
                                type="text"
                                value={card.tag || ''}
                                style={formStyles.input}
                                placeholder="e.g., Most Popular"
                                onChange={(e) => updateCard(planType, cardIndex, 'tag', e.target.value)}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>Plan Title</Form.Label>
                              <Form.Control
                                type="text"
                                value={card.title}
                                style={formStyles.input}
                                onChange={(e) => updateCard(planType, cardIndex, 'title', e.target.value)}
                              />
                            </Form.Group>

                            {(card.sections || []).map((section, sectionIndex) => (
                              <div key={sectionIndex} className="border p-3 mb-3">
                                <h6>Section {sectionIndex + 1}</h6>
                                
                                <Form.Group className="mb-3">
                                  <Form.Label>Section Title</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={section.title || ''}
                                    onChange={(e) => updateSection(planType, cardIndex, sectionIndex, 'title', e.target.value)}
                                  />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                  <Form.Label>Items</Form.Label>
                                  {(section.items || []).map((item, itemIndex) => (
                                    <div key={itemIndex} className="d-flex gap-2 mb-2">
                                      <Form.Control
                                        type="text"
                                        value={item || ''}
                                        onChange={(e) => updateSectionItem(planType, cardIndex, sectionIndex, itemIndex, e.target.value)}
                                      />
                                      <Button variant="danger" size="sm" onClick={() => removeSectionItem(planType, cardIndex, sectionIndex, itemIndex)}>
                                        <i className="fas fa-times"></i>
                                      </Button>
                                    </div>
                                  ))}
                                  <Button size="sm" onClick={() => addSectionItem(planType, cardIndex, sectionIndex)}>
                                    Add Item
                                  </Button>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                  <Form.Label>Icons</Form.Label>
                                  {(section.icons || []).map((icon, iconIndex) => (
                                    <div key={iconIndex} className="d-flex gap-2 mb-2">
                                      <Form.Control
                                        type="text"
                                        value={icon || ''}
                                        onChange={(e) => updateSectionIcon(planType, cardIndex, sectionIndex, iconIndex, e.target.value)}
                                      />
                                      <Button variant="danger" size="sm" onClick={() => removeSectionIcon(planType, cardIndex, sectionIndex, iconIndex)}>
                                        <i className="fas fa-times"></i>
                                      </Button>
                                    </div>
                                  ))}
                                  <Button size="sm" onClick={() => addSectionIcon(planType, cardIndex, sectionIndex)}>
                                    Add Icon
                                  </Button>
                                </Form.Group>
                              </div>
                            ))}

                            <Button size="sm" className="mb-3" onClick={() => addSection(planType, cardIndex)}>
                              Add Section
                            </Button>

                            <Row>
                              <Col>
                                <Form.Group>
                                  <Form.Label>Primary Button Text</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={card.primaryButton || ''}
                                    onChange={(e) => updateCard(planType, cardIndex, 'primaryButton', e.target.value)}
                                  />
                                </Form.Group>
                              </Col>
                              <Col>
                                <Form.Group>
                                  <Form.Label>Secondary Button Text</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={card.secondaryButton || ''}
                                    onChange={(e) => updateCard(planType, cardIndex, 'secondaryButton', e.target.value)}
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                      
                      <Button variant="outline-primary" size="sm" onClick={() => addCard(planType)}>
                        Add New Card
                      </Button>
                    </div>
                  ))}
                </Tab>

                <Tab eventKey="videos" title="Videos">
                  <div className="videos-section">
                    <h5 className="mb-4">Manage Videos</h5>
                    
                    <Card className="mb-4">
                      <Card.Body>
                        <h6 className="mb-3">Add New Video</h6>
                        <div>
                          <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                              type="text"
                              value={newVideo.title || ''}
                              onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={newVideo.description || ''}
                              onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Video URL</Form.Label>
                            <Form.Control
                              type="text"
                              value={newVideo.video_url || ''}
                              onChange={(e) => setNewVideo({...newVideo, video_url: e.target.value})}
                              placeholder="Enter video URL (YouTube, Vimeo, or direct video link)"
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Thumbnail URL</Form.Label>
                            <Form.Control
                              type="text"
                              value={newVideo.thumbnail_url || ''}
                              onChange={(e) => setNewVideo({...newVideo, thumbnail_url: e.target.value})}
                              placeholder="Enter thumbnail image URL"
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Sort Order</Form.Label>
                            <Form.Control
                              type="number"
                              value={newVideo.sort_order || 0}
                              onChange={(e) => setNewVideo({...newVideo, sort_order: parseInt(e.target.value)})}
                            />
                          </Form.Group>

                          <Button variant="primary" onClick={handleAddVideo}>
                            Add Video
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>

                    <div className="videos-list">
                      {formData.videos?.map((video) => (
                        <Card key={video.id} className="mb-3">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="d-flex gap-3">
                                <img 
                                  src={video.thumbnail_url}
                                  alt={video.title} 
                                  style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '4px' }} 
                                />
                                <div>
                                  <h6>{video.title}</h6>
                                  <p className="text-muted small mb-0">{video.description}</p>
                                  <small className="text-muted">Video URL: {video.video_url}</small>
                                </div>
                              </div>
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleEditVideo(video)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleDeleteVideo(video.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </div>
                </Tab>
              </Tabs>

              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      <Col md={5}>
        <Card className="sticky-top" style={{ top: '1rem' }}>
          <Card.Header>
            <h5 className="mb-0">Live Preview</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <PreviewPanel />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default MicrosoftOfficeManager; 