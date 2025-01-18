import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import './QuotationModal.css';

const QuotationModal = ({ show, onHide, selectedProduct, productType }) => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(productType || '');
  const [brandProducts, setBrandProducts] = useState([]);
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
        const response = await axios.get('/backend/api/brands.php');
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
    try {
      // Use brand.name if it's an object from the brands array
      const brandName = typeof brand === 'object' ? brand.name : brand;
      const response = await axios.get(`/backend/api/products.php?brand=${encodeURIComponent(brandName)}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formPayload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName,
        country: formData.country,
        productType: selectedBrand, // Use selectedBrand instead of productType
        productName: selectedProduct?.name || formData.productName,
        message: formData.message
      };

      console.log('Submitting data:', formPayload); // Debug log

      const response = await axios.post('/backend/api/quotations.php', formPayload);

      if (response.data.status === 'success') {
        setShowSuccess(true);
        resetForm();
        setTimeout(() => {
          onHide();
          setShowSuccess(false);
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to submit quotation');
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
      setError(error.response?.data?.message || 'Failed to submit quotation');
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
            {brandProducts.map(product => (
              <div
                key={product.id}
                className={`plan-card ${formData.productName === product.name ? 'selected' : ''}`}
                onClick={() => setFormData({
                  ...formData,
                  productType: selectedBrand,
                  productName: product.name
                })}
              >
                <h3>{product.name}</h3>
                <p className="price">Rs. {product.price}/mo</p>
              </div>
            ))}
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