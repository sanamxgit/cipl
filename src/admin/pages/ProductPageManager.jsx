import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import Preview from '../components/Preview';
import ProductPage from '../../pages/ProductPage';

const ProductPageManager = () => {
  const [pageData, setPageData] = useState({
    slug: 'microsoft-office-365',
    title: '',
    subtitle: '',
    hero_image_url: '',
    background_color: '#ffffff',
    sections: []
  });
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const response = await axios.get('/backend/api/product-pages.php?slug=microsoft-office-365');
      if (response.data.status === 'success') {
        setPageData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching page data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/backend/api/product-pages.php', pageData);
      if (response.data.status === 'success') {
        alert('Page updated successfully!');
        fetchPageData();
      }
    } catch (error) {
      console.error('Error updating page:', error);
      alert('Failed to update page');
    }
  };

  return (
    <>
      <Row className="mb-4">
        <Col>
          <Button 
            variant="outline-primary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </Col>
      </Row>

      {showPreview && (
        <Row className="mb-4">
          <Col>
            <Preview>
              <ProductPage pageData={pageData} />
            </Preview>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="m-0">Edit Microsoft Office 365 Page</h5>
            </Card.Header>
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Row>
                  <Col sm={3}>
                    <Nav variant="pills" className="flex-column">
                      <Nav.Item>
                        <Nav.Link eventKey="general">General</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="hero">Hero Section</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="tabs">Tabs Section</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col sm={9}>
                    <Tab.Content>
                      <Tab.Pane eventKey="general">
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Page Title</Form.Label>
                            <Form.Control
                              type="text"
                              value={pageData.title}
                              onChange={(e) => setPageData({...pageData, title: e.target.value})}
                            />
                          </Form.Group>
                          {/* Add more general fields */}
                        </Form>
                      </Tab.Pane>
                      {/* Add more tab panes for other sections */}
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductPageManager; 