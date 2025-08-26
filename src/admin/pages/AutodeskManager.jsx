import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Tab, Tabs, Row, Col } from 'react-bootstrap';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import AutodeskPage from '../../components/AutodeskPage';

const AutodeskManager = () => {
  const [pageData, setPageData] = useState({
    banner_image: '',
    banner_title: '',
    banner_subtitle: '',
    banner_button_text: 'Learn more',
    banner_button_link: '#',
    help_section_title: '',
    help_section_description: '',
    quote_button_text: 'Get a Quote',
    quote_button_link: '/contact',
    quote_section_title: 'Not sure of the right plan for you?',
    quote_section_subtitle: 'We have a great team here at CIPL waiting to help you with anything.'
  });

  const [faqs, setFaqs] = useState([]);
  const [products, setProducts] = useState([]); // All Autodesk products
  const [loading, setLoading] = useState(true);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [editingFaq, setEditingFaq] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [pageResponse, faqsResponse, productsResponse] = await Promise.all([
        axios.get('/autodesk-page.php'),
        axios.get('/autodesk-faqs.php'),
        axios.get('/autodesk-products.php')
      ]);

      if (pageResponse.data.status === 'success') {
        setPageData(pageResponse.data.data);
      }
      if (faqsResponse.data.status === 'success') {
        setFaqs(faqsResponse.data.data);
      }
      if (productsResponse.data.status === 'success') {
        setProducts(productsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load page data');
    } finally {
      setLoading(false);
    }
  };



  const handleFeaturedProductsChange = (selectedProducts) => {
    setPageData(prev => ({
      ...prev,
      featured_products: selectedProducts
    }));
  };

  const handlePageDataUpdate = async () => {
    try {
      const response = await axios.post('/autodesk-page.php', {
        action: 'update',
        data: pageData
      });

      if (response.data.status === 'success') {
        toast.success('Page updated successfully');
      }
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error('Failed to update page');
    }
  };

  const handleAddFaq = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast.error('Please fill in both question and answer');
      return;
    }

    try {
      const response = await axios.post('/autodesk-faqs.php', {
        action: 'add',
        question: newFaq.question,
        answer: newFaq.answer,
        sort_order: faqs.length
      });

      if (response.data.status === 'success') {
        toast.success('FAQ added successfully');
        setNewFaq({ question: '', answer: '' }); // Clear the form
        fetchAllData();
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast.error('Failed to add FAQ');
    }
  };

  const handleUpdateFaq = async (faq) => {
    try {
      const response = await axios.post('/autodesk-faqs.php', {
        action: 'update',
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sort_order
      });

      if (response.data.status === 'success') {
        toast.success('FAQ updated successfully');
        setEditingFaq(null);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    }
  };

  const handleFaqDelete = async (faqId) => {
    try {
      const response = await axios.post('/autodesk-faqs.php', {
        action: 'delete',
        id: faqId
      });

      if (response.data.status === 'success') {
        toast.success('FAQ deleted successfully');
        fetchAllData();
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="autodesk-manager">
      <h2 className="mb-4">Manage Autodesk Page</h2>
      
      <Row>
        <Col md={6}>
          <Tabs defaultActiveKey="banner" className="mb-4">
            <Tab eventKey="banner" title="Banner Section">
              <Card>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Banner Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={pageData.banner_title}
                        onChange={(e) => setPageData({...pageData, banner_title: e.target.value})}
                        placeholder="Autodesk AI helps you do more with less"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Banner Subtitle</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={pageData.banner_subtitle}
                        onChange={(e) => setPageData({...pageData, banner_subtitle: e.target.value})}
                        placeholder="Our AI technology is available in Autodesk products..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Banner Button Text</Form.Label>
                      <Form.Control
                        type="text"
                        value={pageData.banner_button_text}
                        onChange={(e) => setPageData({...pageData, banner_button_text: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Banner Button Link</Form.Label>
                      <Form.Control
                        type="text"
                        value={pageData.banner_button_link}
                        onChange={(e) => setPageData({...pageData, banner_button_link: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Banner Image</Form.Label>
                      <Form.Control
                        type="text"
                        value={pageData.banner_image}
                        onChange={(e) => setPageData({...pageData, banner_image: e.target.value})}
                      />
                    </Form.Group>

                    <Button onClick={handlePageDataUpdate}>Update Banner Section</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="help" title="Help Section">
              <Card>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Section Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={pageData.help_section_title}
                        onChange={(e) => setPageData({...pageData, help_section_title: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={pageData.help_section_description}
                        onChange={(e) => setPageData({...pageData, help_section_description: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Quote Button Text</Form.Label>
                      <Form.Control
                        type="text"
                        value={pageData.quote_button_text}
                        onChange={(e) => setPageData({...pageData, quote_button_text: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Quote Button Link</Form.Label>
                      <Form.Control
                        type="text"
                        value={pageData.quote_button_link}
                        onChange={(e) => setPageData({...pageData, quote_button_link: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Quote Section Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={pageData.quote_section_title}
                        onChange={(e) => setPageData({...pageData, quote_section_title: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Quote Section Subtitle</Form.Label>
                      <Form.Control
                        type="text"
                        value={pageData.quote_section_subtitle}
                        onChange={(e) => setPageData({...pageData, quote_section_subtitle: e.target.value})}
                      />
                    </Form.Group>

                    <Button onClick={handlePageDataUpdate}>Update Help Section</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="faqs" title="FAQs">
              <Card>
                <Card.Header>FAQs</Card.Header>
                <Card.Body>
                  <Form className="mb-4">
                    <Form.Group className="mb-3">
                      <Form.Label>Question</Form.Label>
                      <Form.Control
                        type="text"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                        placeholder="Enter new question"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Answer</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                        placeholder="Enter answer"
                      />
                    </Form.Group>
                    <Button onClick={handleAddFaq}>Add FAQ</Button>
                  </Form>

                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="mb-4 p-3 border rounded">
                      {editingFaq?.id === faq.id ? (
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>Question</Form.Label>
                            <Form.Control
                              type="text"
                              value={editingFaq.question}
                              onChange={(e) => setEditingFaq({
                                ...editingFaq,
                                question: e.target.value
                              })}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Answer</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={editingFaq.answer}
                              onChange={(e) => setEditingFaq({
                                ...editingFaq,
                                answer: e.target.value
                              })}
                            />
                          </Form.Group>
                          <div className="d-flex gap-2">
                            <Button onClick={() => handleUpdateFaq(editingFaq)}>
                              Save
                            </Button>
                            <Button variant="secondary" onClick={() => setEditingFaq(null)}>
                              Cancel
                            </Button>
                          </div>
                        </Form>
                      ) : (
                        <>
                          <h5>{faq.question}</h5>
                          <p>{faq.answer}</p>
                          <div className="d-flex gap-2">
                            <Button onClick={() => setEditingFaq(faq)}>
                              Edit
                            </Button>
                            <Button variant="danger" onClick={() => handleFaqDelete(faq.id)}>
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Tab>

            
          </Tabs>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>Live Preview</Card.Header>
            <Card.Body className="preview-wrapper">
              <AutodeskPage previewData={pageData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      
    </div>
  );
};

export default AutodeskManager; 