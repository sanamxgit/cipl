import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Tab, Tabs } from 'react-bootstrap';
import axios from '../../config/axios';
import LivePreview from '../components/LivePreview';
import './MicrosoftOfficeManager.css';

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
    title: '',
    subtitle: '',
    banner_image: '',
    isImageUrl: false,
    main_heading: '',
    main_description: '',
    floating_icons: [],
    plans: {
      home: {
        title: 'For Home',
        cards: []
      },
      business: {
        title: 'For Business',
        cards: []
      }
    },
    microsoftLogo: '/images/microsoft-logo.png',
    video_title: '',
    video_description: '',
    video_url: '',
    video_thumbnail_url: '',
    features: []
  });

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    sort_order: 0
  });

  const [editingVideo, setEditingVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [features, setFeatures] = useState([]);
  const [editingFeatures, setEditingFeatures] = useState({});
  const [faqs, setFaqs] = useState([]);
  const [editingFaq, setEditingFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    sort_order: 0,
    is_active: true
  });
  const [contactInfo, setContactInfo] = useState({
    phone_number: '+977-980000000',
    email: 'service@cipl.com',
    chat_title: 'Chat Now',
    chat_description: 'Chat with our support team for quick answers on product features, pricing and more.',
    call_title: 'Call Us',
    call_description: 'Call Our Award Winning Support 24/7'
  });

  useEffect(() => {
    fetchPageData();
    fetchProducts();
    fetchFeatures();
    fetchFAQs();
    fetchVideos();
    fetchContactInfo();
  }, []);

  const fetchPageData = async () => {
    try {
      const response = await axios.get('/microsoft-office.php');
      if (response.data.status === 'success') {
        const data = response.data.data;
        
        // Ensure plans structure
        const plans = {
          home: {
            title: 'For Home',
            cards: []
          },
          business: {
            title: 'For Business',
            cards: []
          },
          ...data.plans
        };

        // Merge the fetched data with default structure
        // Map first backend video (if any) to editable fields for the Video tab
        const firstVideo = (data.videos && data.videos.length > 0) ? data.videos[0] : null;

        const mergedData = {
          ...formData,
          ...data,
          plans,
          video_title: firstVideo?.title || '',
          video_description: firstVideo?.description || '',
          video_url: firstVideo?.video_url || '',
          video_thumbnail_url: firstVideo?.thumbnail_url || ''
        };

        setFormData(mergedData);
        setVideos(Array.isArray(data.videos) ? data.videos : []);
      }
    } catch (error) {
      console.error('Error fetching page data:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/microsoft-products.php');
      if (response.data.status === 'success') {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchFeatures = async () => {
    try {
      const response = await axios.get('/microsoft-features.php');
      if (response.data.status === 'success') {
        setFeatures(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('/microsoft-faqs.php?admin=true');
      if (response.data.status === 'success') {
        setFaqs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/microsoft-video-section.php');
      if (response.data.status === 'success') {
        setVideos(response.data.data ? [response.data.data] : []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    }
  };

  const handleAddFAQ = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      alert('Please fill in both question and answer fields');
      return;
    }

    axios.post('/microsoft-faqs.php', newFaq)
      .then(response => {
        if (response.data.status === 'success') {
          setNewFaq({ question: '', answer: '', sort_order: 0, is_active: true });
          fetchFAQs();
          alert('FAQ added successfully!');
        }
      })
      .catch(error => {
        console.error('Error adding FAQ:', error);
        alert('Failed to add FAQ');
      });
  };

  const handleEditFAQ = (faq) => {
    setEditingFaq(faq);
  };

  const handleUpdateFAQ = async (faq) => {
    try {
      const response = await axios.put(`/microsoft-faqs.php?id=${faq.id}`, faq);
      if (response.data.status === 'success') {
        setEditingFaq(null);
        fetchFAQs();
        alert('FAQ updated successfully!');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert('Failed to update FAQ');
    }
  };

  const handleDeleteFAQ = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await axios.delete(`/microsoft-faqs.php?id=${id}`);
        fetchFAQs();
        alert('FAQ deleted successfully!');
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        alert('Failed to delete FAQ');
      }
    }
  };

  const handleToggleFAQStatus = async (faq) => {
    try {
      const response = await axios.put(`/microsoft-faqs.php?id=${faq.id}`, {
        ...faq,
        is_active: !faq.is_active
      });
      if (response.data.status === 'success') {
        setFaqs(faqs.map(f => 
          f.id === faq.id 
            ? { ...f, is_active: !f.is_active }
            : f
        ));
      }
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
      alert('Failed to update FAQ status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit only page fields (General + Plans)
      const {
        title,
        subtitle,
        banner_image,
        isImageUrl,
        main_heading,
        main_description,
        floating_icons,
        plans,
        microsoftLogo
      } = formData;

      const response = await axios.post('/microsoft-office.php', {
        title,
        subtitle,
        banner_image,
        isImageUrl,
        main_heading,
        main_description,
        floating_icons,
        plans,
        microsoftLogo
      });

      if (response.data.status === 'success') {
        alert('Changes saved successfully!');
        await fetchPageData();
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/upload.php', formData, {
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
    if (!formData.video_title || !formData.video_url) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const videoData = {
        title: formData.video_title,
        description: formData.video_description,
        video_url: formData.video_url,
        thumbnail_url: formData.video_thumbnail_url,
        sort_order: 0
      };
      
      const response = await axios.post('/microsoft-video-section.php', videoData);
      if (response.data.status === 'success') {
        setFormData({
          ...formData,
          video_title: '',
          video_description: '',
          video_url: '',
          video_thumbnail_url: ''
        });
        fetchVideos();
        alert('Video added successfully!');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Error adding video');
    }
  };

  const handleEditVideo = async (video) => {
    setEditingVideo(video);
  };

  const handleSaveEdit = async (videoId) => {
    if (!editingVideo) return;

    try {
      const response = await axios.put('/microsoft-video-section.php', editingVideo);
      if (response.data.status === 'success') {
        setEditingVideo(null);
        fetchVideos();
        alert('Video updated successfully!');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Error updating video');
    }
  };

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get('/contact-info.php');
      if (response.data.status === 'success') {
        setContactInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
  };

  const handleUpdateContactInfo = async () => {
    try {
      const response = await axios.put('/contact-info.php', contactInfo);
      if (response.data.status === 'success') {
        alert('Contact information updated successfully!');
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      alert('Error updating contact information');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await axios.delete('/microsoft-video-section.php', { data: { id: videoId } });
      if (response.data.status === 'success') {
        fetchVideos();
        alert('Video deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.post('/microsoft-products.php', {
          action: 'delete',
          product_id: productId
        });

        if (response.data.status === 'success') {
          alert('Product deleted successfully!');
          fetchProducts(); // Refresh the products list
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/microsoft-products.php', {
        action: 'update',
        product: editingProduct
      });

      if (response.data.status === 'success') {
        alert('Product updated successfully!');
        setEditingProduct(null);
        fetchProducts(); // Refresh the products list
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleFeatureUpdate = async (feature) => {
    try {
      const response = await axios.post('/microsoft-features.php', {
        action: 'update',
        ...feature
      });
      
      if (response.data.status === 'success') {
        fetchFeatures();
        // Don't show alert for better UX
      }
    } catch (error) {
      console.error('Error updating feature:', error);
      alert('Failed to update feature');
    }
  };

  const handleAddFeature = async () => {
    try {
      const newFeature = {
        title: 'New Feature',
        description: 'Feature description',
        image_url: '',
        link_url: '',
        sort_order: features.length
      };

      const response = await axios.post('/microsoft-features.php', {
        action: 'add',
        ...newFeature
      });
      
      if (response.data.status === 'success') {
        fetchFeatures();
        alert('Feature added successfully');
      }
    } catch (error) {
      console.error('Error adding feature:', error);
      alert('Failed to add feature');
    }
  };

  const handleRemoveFeature = async (id) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        const response = await axios.post('/microsoft-features.php', {
          action: 'delete',
          id
        });
        
        if (response.data.status === 'success') {
          fetchFeatures();
          alert('Feature deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting feature:', error);
        alert('Failed to delete feature');
      }
    }
  };

  const handleFeatureInputChange = (feature, field, value) => {
    setEditingFeatures(prev => ({
      ...prev,
      [feature.id]: {
        ...prev[feature.id],
        ...feature,
        [field]: value
      }
    }));
  };

  const handleFeatureBlur = (featureId) => {
    if (editingFeatures[featureId]) {
      handleFeatureUpdate(editingFeatures[featureId]);
      // Clear the temporary edit
      setEditingFeatures(prev => {
        const newState = { ...prev };
        delete newState[featureId];
        return newState;
      });
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
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Get started with Microsoft Office 365 today"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Subtitle</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      placeholder="Collaborate, create, and achieve more..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Banner Image URL</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.banner_image}
                      onChange={(e) => setFormData({...formData, banner_image: e.target.value})}
                      placeholder="Enter banner image URL"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Main Heading</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.main_heading}
                      onChange={(e) => setFormData({...formData, main_heading: e.target.value})}
                      placeholder="Unlock productivity, creativity..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Main Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.main_description}
                      onChange={(e) => setFormData({...formData, main_description: e.target.value})}
                      placeholder="Microsoft 365 empowers your employees..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Microsoft Partner Logo</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.microsoftLogo}
                      onChange={(e) => setFormData({...formData, microsoftLogo: e.target.value})}
                      placeholder="Enter Microsoft Partner logo URL"
                    />
                  </Form.Group>
                </Tab>

                <Tab eventKey="plans" title="Plans">
                  {Object.entries(formData.plans || {}).map(([planType, planData]) => (
                    <div key={planType} className="mb-4">
                      <h6 className="mb-3">{planData.title}</h6>
                      {(planData.cards || []).map((card, cardIndex) => (
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

                <Tab eventKey="video" title="Video">
                  <div className="video-settings">
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Video Settings</h5>
                      </Card.Header>
                      <Card.Body>
                      <Row>
                        <Col md={8}>
                          {/* Existing videos list */}
                          {videos && videos.length > 0 && (
                            <div className="mb-4">
                              <h6 className="mb-3">Existing Videos</h6>
                              <div className="d-flex flex-column gap-3">
                                {videos.map((v) => (
                                  <Card key={v.id}>
                                    <Card.Body className="d-flex align-items-center justify-content-between">
                                      <div>
                                        <div className="fw-semibold">{v.title || 'Untitled'}</div>
                                        <div className="text-muted small">{v.description || ''}</div>
                                        <div className="text-muted small">Video: {v.video_url}</div>
                                        <div className="text-muted small">Thumbnail: {v.thumbnail_url}</div>
                                      </div>
                                      <div className="d-flex gap-2">
                                        <Button size="sm" variant="outline-primary" onClick={() => handleEditVideo(v)}>Edit</Button>
                                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteVideo(v.id)}>Delete</Button>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Edit existing video */}
                          {editingVideo && (
                            <Card className="mb-4">
                              <Card.Header>
                                <h6 className="mb-0">Edit Video</h6>
                              </Card.Header>
                              <Card.Body>
                                <Form.Group className="mb-3">
                                  <Form.Label>Title</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={editingVideo.title || ''}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label>Description</Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={editingVideo.description || ''}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label>Video URL</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={editingVideo.video_url || ''}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value })}
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label>Thumbnail URL</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={editingVideo.thumbnail_url || ''}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })}
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label>Sort Order</Form.Label>
                                  <Form.Control
                                    type="number"
                                    value={editingVideo.sort_order ?? 0}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, sort_order: parseInt(e.target.value || '0', 10) })}
                                  />
                                </Form.Group>
                                <div className="d-flex gap-2">
                                  <Button variant="success" onClick={() => handleSaveEdit(editingVideo.id)}>Save</Button>
                                  <Button variant="secondary" onClick={() => setEditingVideo(null)}>Cancel</Button>
                                </div>
                              </Card.Body>
                            </Card>
                          )}

                          {/* Add new video */}
                          <Form.Group className="mb-3">
                            <Form.Label>Video Title</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.video_title || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                video_title: e.target.value
                              })}
                              placeholder="Enter video title"
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Video Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={formData.video_description || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                video_description: e.target.value
                              })}
                              placeholder="Enter video description"
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Video URL</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.video_url || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                video_url: e.target.value
                              })}
                              placeholder="Enter video URL (e.g., https://example.com/video.mp4)"
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Thumbnail URL</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.video_thumbnail_url || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                video_thumbnail_url: e.target.value
                              })}
                              placeholder="Enter thumbnail URL (e.g., https://example.com/thumbnail.jpg)"
                            />
                          </Form.Group>
                          <div className="d-flex gap-2">
                            <Button variant="primary" onClick={handleAddVideo}>Add Video</Button>
                          </div>
                        </Col>

                        <Col md={4}>
                          <div className="preview-section">
                            <h6 className="mb-3">Preview</h6>
                            {formData.video_thumbnail_url ? (
                              <div className="thumbnail-preview">
                                <img
                                  src={formData.video_thumbnail_url}
                                  alt="Video thumbnail"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="no-preview">
                                <p className="text-muted">No thumbnail preview available</p>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  </div>
                </Tab>

                <Tab eventKey="products" title="Products">
                  <div className="products-section">
                    <h5 className="mb-4">Microsoft Products</h5>
                    <Card>
                      <Card.Body>
                        {editingProduct ? (
                          <Form onSubmit={handleSaveProduct}>
                            <Form.Group className="mb-3">
                              <Form.Label>Product Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={editingProduct.name}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  name: e.target.value
                                })}
                              />
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label>Description</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={editingProduct.description}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  description: e.target.value
                                })}
                              />
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label>Price</Form.Label>
                              <Form.Control
                                type="number"
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  price: e.target.value
                                })}
                              />
                            </Form.Group>
                            <div className="d-flex gap-2">
                              <Button type="submit" variant="primary">
                                Save Changes
                              </Button>
                              <Button 
                                variant="secondary"
                                onClick={() => setEditingProduct(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </Form>
                        ) : (
                          <div className="products-grid">
                            {products.map((product) => (
                              <div key={product.id} className="product-item">
                                <img src={product.image_url} alt={product.name} />
                                <div className="product-details">
                                  <h6>{product.name}</h6>
                                  <p>{product.description}</p>
                                  <div className="product-price">${product.price}</div>
                                </div>
                                <div className="product-actions">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </Tab>

                <Tab eventKey="features" title="Features">
                  <Card>
                    <Card.Body>
                      <h5 className="mb-4">Microsoft 365 Features</h5>
                      <Button 
                        variant="primary"
                        className="mb-4"
                        onClick={handleAddFeature}
                      >
                        Add New Feature
                      </Button>
                      {features.map((feature) => (
                        <div key={feature.id} className="feature-item mb-4 p-3 border rounded">
                          <Form.Group className="mb-3">
                            <Form.Label>Feature Title</Form.Label>
                            <Form.Control
                              type="text"
                              value={editingFeatures[feature.id]?.title ?? feature.title}
                              onChange={(e) => handleFeatureInputChange(feature, 'title', e.target.value)}
                              onBlur={() => handleFeatureBlur(feature.id)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={editingFeatures[feature.id]?.description ?? feature.description}
                              onChange={(e) => handleFeatureInputChange(feature, 'description', e.target.value)}
                              onBlur={() => handleFeatureBlur(feature.id)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                              type="text"
                              value={editingFeatures[feature.id]?.image_url ?? feature.image_url}
                              onChange={(e) => handleFeatureInputChange(feature, 'image_url', e.target.value)}
                              onBlur={() => handleFeatureBlur(feature.id)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Link URL</Form.Label>
                            <Form.Control
                              type="text"
                              value={editingFeatures[feature.id]?.link_url ?? feature.link_url}
                              onChange={(e) => handleFeatureInputChange(feature, 'link_url', e.target.value)}
                              onBlur={() => handleFeatureBlur(feature.id)}
                            />
                          </Form.Group>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleRemoveFeature(feature.id)}
                          >
                            Remove Feature
                          </Button>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Tab>

                <Tab eventKey="faqs" title="FAQs">
                  <Card>
                    <Card.Body>
                      <h5 className="mb-4">Microsoft 365 FAQs</h5>
                      
                      {/* Add New FAQ Form */}
                      <Card className="mb-4">
                        <Card.Header>
                          <h6 className="mb-0">Add New FAQ</h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Question</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  value={newFaq.question}
                                  onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                                  placeholder="Enter the question"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Sort Order</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={newFaq.sort_order}
                                  onChange={(e) => setNewFaq({...newFaq, sort_order: parseInt(e.target.value)})}
                                  placeholder="0"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Form.Group className="mb-3">
                            <Form.Label>Answer</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              value={newFaq.answer}
                              onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                              placeholder="Enter the answer"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              label="Active"
                              checked={newFaq.is_active}
                              onChange={(e) => setNewFaq({...newFaq, is_active: e.target.checked})}
                            />
                          </Form.Group>
                          <Button 
                            variant="primary"
                            onClick={handleAddFAQ}
                          >
                            Add FAQ
                          </Button>
                        </Card.Body>
                      </Card>

                      {/* Existing FAQs List */}
                      <div className="faqs-list">
                        {faqs.map((faq) => (
                          <Card key={faq.id} className="mb-3">
                            <Card.Body>
                              {editingFaq && editingFaq.id === faq.id ? (
                                <div>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Question</Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={2}
                                      value={editingFaq.question}
                                      onChange={(e) => setEditingFaq({...editingFaq, question: e.target.value})}
                                    />
                                  </Form.Group>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Answer</Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={4}
                                      value={editingFaq.answer}
                                      onChange={(e) => setEditingFaq({...editingFaq, answer: e.target.value})}
                                    />
                                  </Form.Group>
                                  <Row>
                                    <Col md={6}>
                                      <Form.Group className="mb-3">
                                        <Form.Label>Sort Order</Form.Label>
                                        <Form.Control
                                          type="number"
                                          value={editingFaq.sort_order}
                                          onChange={(e) => setEditingFaq({...editingFaq, sort_order: parseInt(e.target.value)})}
                                        />
                                      </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                      <Form.Group className="mb-3">
                                        <Form.Check
                                          type="checkbox"
                                          label="Active"
                                          checked={editingFaq.is_active}
                                          onChange={(e) => setEditingFaq({...editingFaq, is_active: e.target.checked})}
                                        />
                                      </Form.Group>
                                    </Col>
                                  </Row>
                                  <div className="d-flex gap-2">
                                    <Button 
                                      variant="success" 
                                      size="sm"
                                      onClick={() => handleUpdateFAQ(editingFaq)}
                                    >
                                      Save
                                    </Button>
                                    <Button 
                                      variant="secondary" 
                                      size="sm"
                                      onClick={() => setEditingFaq(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="flex-grow-1">
                                      <h6 className="mb-2">{faq.question}</h6>
                                      <p className="text-muted mb-2">{faq.answer}</p>
                                      <div className="d-flex gap-3 text-muted small">
                                        <span>Sort: {faq.sort_order}</span>
                                        <span className={`badge ${faq.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                          {faq.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                      <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={() => handleEditFAQ(faq)}
                                      >
                                        Edit
                                      </Button>
                                      <Button 
                                        variant={faq.is_active ? 'outline-warning' : 'outline-success'} 
                                        size="sm"
                                        onClick={() => handleToggleFAQStatus(faq)}
                                      >
                                        {faq.is_active ? 'Deactivate' : 'Activate'}
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => handleDeleteFAQ(faq.id)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Tab>

                <Tab eventKey="contact" title="Contact Info">
                  <div className="contact-info-section">
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">Contact Information Settings</h5>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="text"
                                value={contactInfo.phone_number || ''}
                                onChange={(e) => setContactInfo({...contactInfo, phone_number: e.target.value})}
                                placeholder="+977-980000000"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email Address</Form.Label>
                              <Form.Control
                                type="email"
                                value={contactInfo.email || ''}
                                onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                                placeholder="service@cipl.com"
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Call Title</Form.Label>
                              <Form.Control
                                type="text"
                                value={contactInfo.call_title || ''}
                                onChange={(e) => setContactInfo({...contactInfo, call_title: e.target.value})}
                                placeholder="Call Us"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Chat Title</Form.Label>
                              <Form.Control
                                type="text"
                                value={contactInfo.chat_title || ''}
                                onChange={(e) => setContactInfo({...contactInfo, chat_title: e.target.value})}
                                placeholder="Chat Now"
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Call Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={contactInfo.call_description || ''}
                            onChange={(e) => setContactInfo({...contactInfo, call_description: e.target.value})}
                            placeholder="Call Our Award Winning Support 24/7"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Chat Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={contactInfo.chat_description || ''}
                            onChange={(e) => setContactInfo({...contactInfo, chat_description: e.target.value})}
                            placeholder="Chat with our support team for quick answers on product features, pricing and more."
                          />
                        </Form.Group>

                        <div className="d-flex gap-2">
                          <Button 
                            variant="primary" 
                            onClick={handleUpdateContactInfo}
                          >
                            Update Contact Information
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
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
            <LivePreview formData={formData} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default MicrosoftOfficeManager; 