import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './QuotationModal.css';

const QuotationModal = ({ show, onHide, selectedProduct, productType }) => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(productType || '');
  const [brandProducts, setBrandProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]); // Multiple product selection
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    companyName: '',
    country: '',
    productType: productType || '',
    productName: selectedProduct ? selectedProduct.name : '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch all brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await api.get('/brands.php');
        if (response.data.status === 'success') {
          setBrands(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  // Fetch products when brand changes
  const handleBrandChange = async (brand) => {
    setSelectedBrand(brand);
    setSelectedProducts([]); // Reset selected products when brand changes
    try {
      // Use brand.name if it's an object from the brands array
      const brandName = typeof brand === 'object' ? brand.name : brand;
      const response = await api.get(`/products.php?brand=${encodeURIComponent(brandName)}`);
      console.log('Products response:', response.data); // Debug log
      if (response.data.status === 'success') {
        setBrandProducts(response.data.data);
        setFormData(prev => ({
          ...prev,
          productType: brandName,
          productName: ''
        }));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  // Set initial brand products if product type is provided
  useEffect(() => {
    if (productType && selectedProduct) {
      setSelectedBrand(productType);
      setFormData(prev => ({
        ...prev,
        productType: productType,
        productName: selectedProduct.name
      }));
      handleBrandChange(productType);
    }
  }, [productType, selectedProduct]);

  // Handle product selection
  const handleProductSelect = (product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate that at least one product is selected
    if (selectedProducts.length === 0 && !selectedProduct && !formData.productName) {
      setError('Please select at least one product');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create payload for each selected product
      const productNames = selectedProducts.length > 0 
        ? selectedProducts.map(p => p.name).join(', ')
        : (selectedProduct?.name || formData.productName);

      const formPayload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName,
        country: formData.country,
        productType: selectedBrand,
        productName: productNames,
        message: formData.message
      };

      console.log('Submitting data:', formPayload); // Debug log

      const response = await api.post('/quotations.php', formPayload);

      console.log('API Response:', response); // Debug log
      console.log('Response status:', response.status); // Debug log
      console.log('Response data:', response.data); // Debug log

      if (response.data.status === 'success') {
        setShowSuccess(true);
        resetForm();
        setSelectedProducts([]);
        setTimeout(() => {
          onHide();
          setShowSuccess(false);
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to submit quotation');
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
      console.error('Error response:', error.response); // Debug log
      console.error('Error message:', error.message); // Debug log
      
      // Check if it's a network error or API error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(error.message || 'Failed to submit quotation');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      companyName: '',
      country: '',
      productType: productType || '',
      productName: selectedProduct ? selectedProduct.name : '',
      message: ''
    });
    setSelectedProducts([]);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="quotation-modal">
      <Modal.Header closeButton>
        <Modal.Title>Get a Quotation!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center subtitle mb-4">
          Streamlined Solutions for Your Budget: Secure Accurate Quotes with Confidence
          on Our Quotation Platform
        </p>

        <div className="product-types mb-4">
          {brands.map(brand => (
            <Button
              key={brand.id}
              variant={selectedBrand === brand.name ? 'primary' : 'light'}
              onClick={() => handleBrandChange(brand)}
            >
              {brand.name}
            </Button>
          ))}
        </div>

        {selectedBrand && brandProducts.length > 0 && (
          <div className="product-plans mb-4">
            <h5 className="mb-3">Select Products:</h5>
            <div className="row">
              {brandProducts.map(product => {
                const isSelected = selectedProducts.some(p => p.id === product.id);
                return (
                  <div key={product.id} className="col-md-6 mb-3">
                    <div
                      className={`plan-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleProductSelect(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="product-image mb-2"
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      )}
                      <h6 className="mb-2">{product.name}</h6>
                      <p className="price mb-2">${product.price}/mo</p>
                      <div className="selection-indicator">
                        {isSelected ? '✓ Selected' : 'Click to select'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedProducts.length > 0 && (
              <div className="selected-products mt-3">
                <h6>Selected Products:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {selectedProducts.map(product => (
                    <span key={product.id} className="badge bg-primary">
                      {product.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showSuccess && (
          <div className="alert alert-success text-center mb-4">
            <h5>✓ Quotation Submitted Successfully!</h5>
            <p>We'll get back to you soon with your custom quote.</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center mb-4">
            {error}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name*</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number*</Form.Label>
                <Form.Control
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email*</Form.Label>
            <Form.Control
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Country / Region</Form.Label>
            <Form.Control
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Message (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </Form.Group>

          <Button type="submit" className="w-100" disabled={isSubmitting}>Submit Request</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default QuotationModal; 