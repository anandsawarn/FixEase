import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaCheck, 
  FaExclamationTriangle, 
  FaRegClock, 
  FaArrowLeft, 
  FaPlus, 
  FaMinus,
  FaHome,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaRupeeSign
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const BookService = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { service: initialService } = location.state || {};
  
  const [services, setServices] = useState(initialService ? [initialService] : []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    pincode: '',
    additionalMessage: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Calculate total price
  const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0);

  useEffect(() => {
    if (services.length === 0 && !initialService) {
      navigate('/services');
    }

    // Load available services
    const fetchServices = async () => {
      try {
        const response = await axios.get('https://fixease.onrender.com/api/services');
        setAvailableServices(response.data.filter(s => !services.some(selected => selected._id === s._id)));
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();

    // Load saved form data if exists
    const savedFormData = localStorage.getItem('bookingFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }

    // Load total price from localStorage if exists
    const savedTotalPrice = localStorage.getItem('bookingTotalPrice');
    if (savedTotalPrice && services.length === 0) {
      setServices(JSON.parse(savedTotalPrice).services || []);
    }

    // Load Razorpay script
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, [initialService, navigate, services]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }

    const updatedFormData = { ...formData, [name]: value };
    localStorage.setItem('bookingFormData', JSON.stringify(updatedFormData));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone must be 10 digits';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
    }
    
    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }

    if (services.length === 0) {
      errors.services = 'At least one service must be selected';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const bookingPayload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        pincode: formData.pincode.trim(),
        additionalMessage: formData.additionalMessage.trim(),
        serviceIds: services.map(s => s._id),
        status: 'pending',
        totalPrice: totalPrice
      };

      // Save total price and services to localStorage before submitting
      localStorage.setItem('bookingTotalPrice', JSON.stringify({
        totalPrice: totalPrice,
        services: services
      }));

      const response = await axios.post('https://fixease.onrender.com/api/book-service', bookingPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status >= 200 && response.status < 300) {
        setBookingStatus({ 
          success: true, 
          message: `Booking successful! Total to pay: ₹${totalPrice}. We will contact you shortly.`,
          bookingId: response.data._id,
          totalPrice: totalPrice
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          address: '',
          pincode: '',
          additionalMessage: ''
        });
        setServices([]);
        localStorage.removeItem('bookingFormData');
        localStorage.removeItem('bookingTotalPrice');
      }
    } catch (err) {
      console.error('Booking error:', err);
      let errorMessage = 'Booking failed. Please try again.';
      let errorDetails = null;
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data.message || 'Invalid data. Please check your inputs.';
          errorDetails = err.response.data.errors;
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      setBookingStatus({ 
        success: false, 
        message: errorMessage,
        details: errorDetails
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiatePayment = async () => {
    if (!bookingStatus?.totalPrice) return;
    
    setPaymentLoading(true);
    try {
      // Create order on your backend
      const orderResponse = await axios.post('https://fixease.onrender.com/api/v1/create-order', {
        amount: bookingStatus.totalPrice, 
        currency: 'INR'
      });

      // Get Razorpay key
      const keyResponse = await axios.get('https://fixease.onrender.com/api/v1/getKey');

      const options = {
        key: keyResponse.data.key,
        amount: orderResponse.data.order.amount,
        currency: orderResponse.data.order.currency,
        name: "Service Booking",
        description: "Payment for services",
        order_id: orderResponse.data.order.id,
        handler: async function(response) {
          // Verify payment on your backend
          const verificationResponse = await axios.post('https://fixease.onrender.com/api/v1/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: bookingStatus.bookingId
          });

          if (verificationResponse.data.success) {
            setBookingStatus(prev => ({
              ...prev,
              message: `Payment successful! Your booking is confirmed. Total paid: ₹${bookingStatus.totalPrice}`,
              paid: true
            }));
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phoneNumber
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const addService = (service) => {
    if (!services.some(s => s._id === service._id)) {
      setServices([...services, service]);
      setAvailableServices(availableServices.filter(s => s._id !== service._id));
    }
    setShowServiceSelection(false);
  };

  const removeService = (serviceId) => {
    const serviceToRemove = services.find(s => s._id === serviceId);
    setServices(services.filter(s => s._id !== serviceId));
    if (serviceToRemove) {
      setAvailableServices([...availableServices, serviceToRemove]);
    }
  };

  if (services.length === 0 && !initialService) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <button 
            onClick={() => navigate('/services')}
            className="flex items-center text-blue-600 hover:text-blue-800 mx-auto mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Services
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Book Your Services</h1>
          <div className="flex items-center justify-center">
            <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
          </div>
          <p className="text-lg text-blue-600 mt-4 flex items-center justify-center">
            <FaInfoCircle className="mr-2" />
            Pay After Service - No upfront payment required
          </p>
        </motion.div>

        {/* Service Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaHome className="mr-2 text-blue-500" />
              Selected Services
            </h3>
            <button 
              onClick={() => setShowServiceSelection(!showServiceSelection)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <FaPlus className="mr-2" />
              Add Service
            </button>
          </div>

          {formErrors.services && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mb-4 flex items-center bg-red-50 p-3 rounded-lg"
            >
              <FaExclamationTriangle className="mr-2" />
              {formErrors.services}
            </motion.p>
          )}

          {/* Service Selection Dropdown */}
          <AnimatePresence>
            {showServiceSelection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 overflow-hidden"
              >
                <h4 className="font-medium text-gray-700 mb-3">Available Services</h4>
                {availableServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableServices.map(service => (
                      <motion.div 
                        key={service._id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div>
                          <p className="font-medium">{service.title}</p>
                          <p className="text-sm text-gray-600">₹{service.price}</p>
                        </div>
                        <button 
                          onClick={() => addService(service)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-3">No additional services available</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Services List */}
          <div className="space-y-4">
            {services.map(service => (
              <motion.div 
                key={service._id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div>
                  <p className="font-medium text-gray-800">{service.title}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaRegClock className="mr-2 text-blue-500" />
                    {service.duration || '1-2 hours'} • {service.category}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="font-bold text-blue-600 mr-4">₹{service.price}</p>
                  <button 
                    onClick={() => removeService(service._id)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    disabled={services.length <= 1}
                  >
                    <FaMinus />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total Price */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="mt-6 pt-4 border-t border-blue-200 flex justify-between items-center"
          >
            <p className="text-lg font-medium text-gray-700">Total to pay after service:</p>
            <p className="text-2xl font-bold text-blue-600">₹{totalPrice}</p>
          </motion.div>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-blue-100"
        >
          {bookingStatus ? (
            <div className={`p-6 rounded-xl text-center ${bookingStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex flex-col items-center">
                {bookingStatus.success ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      <FaCheck className="text-4xl text-green-500 mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-medium mb-2">{bookingStatus.message}</h3>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="mt-4 p-4 bg-white rounded-lg shadow-sm"
                    >
                      <p className="text-lg font-semibold flex items-center justify-center">
                        <FaRupeeSign className="mr-1" />
                        {bookingStatus.totalPrice || totalPrice}
                      </p>
                    </motion.div>
                    
                    {!bookingStatus.paid && (
                      <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/services')}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        >
                          Back to Services
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={initiatePayment}
                          disabled={paymentLoading}
                          className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md flex items-center justify-center ${
                            paymentLoading ? 'opacity-75 cursor-not-allowed' : ''
                          }`}
                        >
                          {paymentLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            'Pay Now for Instant Service'
                          )}
                        </motion.button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-medium mb-2">{bookingStatus.message}</h3>
                  </>
                )}
                {bookingStatus.details && (
                  <div className="mt-3 text-sm text-left bg-white p-3 rounded-lg shadow-sm">
                    {Object.entries(bookingStatus.details).map(([field, error]) => (
                      <p key={field} className="text-red-600">
                        <strong>{field}:</strong> {error}
                      </p>
                    ))}
                  </div>
                )}
                {bookingStatus.bookingId && (
                  <p className="mt-2 text-sm bg-white p-3 rounded-lg shadow-sm">
                    Booking ID: <span className="font-mono font-bold">{bookingStatus.bookingId}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
                <FaUser className="mr-2 text-blue-500" />
                Enter Your Details
              </h2>
              
              <div className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaUser className="mr-2 text-blue-500 text-sm" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                    }`}
                    placeholder="John Doe"
                    required
                  />
                  {formErrors.name && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center"
                    >
                      <FaExclamationTriangle className="mr-1" />
                      {formErrors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email and Phone */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaEnvelope className="mr-2 text-blue-500 text-sm" />
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                      placeholder="john@example.com"
                      required
                    />
                    {formErrors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center"
                      >
                        <FaExclamationTriangle className="mr-1" />
                        {formErrors.email}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaPhone className="mr-2 text-blue-500 text-sm" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        formErrors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                      placeholder="9876543210"
                      required
                    />
                    {formErrors.phoneNumber && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center"
                      >
                        <FaExclamationTriangle className="mr-1" />
                        {formErrors.phoneNumber}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-500 text-sm" />
                    Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      formErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                    }`}
                    placeholder="Your complete address"
                    required
                  ></textarea>
                  {formErrors.address && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center"
                    >
                      <FaExclamationTriangle className="mr-1" />
                      {formErrors.address}
                    </motion.p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-500 text-sm" />
                    Pincode *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      formErrors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                    }`}
                    placeholder="560001"
                    required
                  />
                  {formErrors.pincode && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center"
                    >
                      <FaExclamationTriangle className="mr-1" />
                      {formErrors.pincode}
                    </motion.p>
                  )}
                </div>

                {/* Additional Message */}
                <div>
                  <label htmlFor="additionalMessage" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaInfoCircle className="mr-2 text-blue-500 text-sm" />
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="additionalMessage"
                    name="additionalMessage"
                    value={formData.additionalMessage}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition"
                    placeholder="Any special instructions..."
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  className={`w-full px-6 py-3 text-lg font-medium rounded-lg transition-all ${
                    isSubmitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FaCheck className="mr-2" />
                      Book Services (₹{totalPrice})
                    </span>
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

    </div>
  );
};

export default BookService;