import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaWhatsapp, FaMapMarkerAlt, FaClock, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { contactDetails } from "../../config";
import Footer from "../../Components/Footer";
import Navbar from "../../Components/Navbar";

const Contact = () => {
  const whatsappMessage = `Hello FixEase Team,

I am interested in your services. Please send me more information about:

1. Home Repairs
2. Plumbing Services
3. Electrical Services
4. Appliance Maintenance
5. Cleaning Services

Thank you!`;

  const [showModal, setShowModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    name: "",
    city: "",
    message: "",
    hover: 0
  });
  const [callbackForm, setCallbackForm] = useState({
    name: "",
    phoneNumber: "",
    query: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  const handleCall = () => {
    window.location.href = `tel:${contactDetails.phoneNumber}`;
  };

  const handleWhatsApp = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${contactDetails.whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  const handleEmail = () => {
    window.location.href = `mailto:${contactDetails.email}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleCallbackInputChange = (e) => {
    const { name, value } = e.target;
    setCallbackForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitCallback = async () => {
    if (!callbackForm.name || !callbackForm.phoneNumber || !callbackForm.query) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://fixease.onrender.com/api/user-queries/submit-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(callbackForm),
      });

      if (response.ok) {
        setCallbackSuccess(true);
        setTimeout(() => {
          setShowCallbackModal(false);
          setCallbackSuccess(false);
          setCallbackForm({
            name: "",
            phoneNumber: "",
            query: ""
          });
        }, 2000);
      } else {
        throw new Error("Failed to submit callback request");
      }
    } catch (error) {
      console.error("Error submitting callback:", error);
      alert("Failed to submit callback request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedback.rating === 0) {
      alert("Please provide a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://fixease.onrender.com/api/testimonials/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: feedback.rating,
          name: feedback.name,
          city: feedback.city,
          message: feedback.message
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitSuccess(false);
          setFeedback({
            rating: 0,
            name: "",
            city: "",
            message: "",
            hover: 0
          });
        }, 2000);
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to partially hide phone number
  const getHiddenPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";
    const visibleDigits = 3;
    const hiddenPart = phoneNumber.slice(visibleDigits).replace(/[0-9]/g, '•');
    return phoneNumber.slice(0, visibleDigits) + hiddenPart;
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen -my-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16 flex-grow w-full">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16 pt-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Connect With <span className="text-blue-500">FixEase</span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Our team is always ready to assist you with your home service needs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8"
            >
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setShowCallbackModal(true)}
              >
                Request a Callback
              </button>
            </motion.div>
          </motion.div>

          {/* Contact Section */}
          <section className="mb-20">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12 shadow-lg border border-blue-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold text-blue-700 mb-6">Get In Touch</h2>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Have questions or need assistance? Our friendly customer support team is available 24/7 to help with all your home service needs.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                        <FaMapMarkerAlt className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Our Location</h3>
                        <p className="text-gray-600">{contactDetails.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                        <FaClock className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Working Hours</h3>
                        <p className="text-gray-600">24/7 Emergency Services</p>
                        <p className="text-gray-600">Mon-Sun: 8:00 AM - 10:00 PM</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Methods */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: <FaPhoneAlt className="text-blue-600 text-2xl" />,
                        title: "Call Us",
                        action: handleCall,
                        text: "Click to call our support",
                        subtext: "Available 24/7",
                        bg: "bg-blue-100",
                        hover: "hover:bg-blue-50",
                        hideNumber: true
                      },
                      {
                        icon: <FaWhatsapp className="text-green-600 text-2xl" />,
                        title: "WhatsApp",
                        action: handleWhatsApp,
                        text: "Click to chat on WhatsApp",
                        subtext: "Fast response guaranteed",
                        bg: "bg-green-100",
                        hover: "hover:bg-green-50",
                        hideNumber: true
                      },
                      {
                        icon: <FaEnvelope className="text-red-600 text-2xl" />,
                        title: "Email Us",
                        action: handleEmail,
                        text: contactDetails.email,
                        subtext: "We reply within 2 hours",
                        bg: "bg-red-100",
                        hover: "hover:bg-red-50"
                      },
                      {
                        icon: <FaMapMarkerAlt className="text-purple-600 text-2xl" />,
                        title: "Visit Us",
                        action: () => window.open("https://maps.google.com", "_blank"),
                        text: "Schedule an office visit",
                        subtext: "View on Google Maps",
                        bg: "bg-purple-100",
                        hover: "hover:bg-purple-50"
                      }
                    ].map((method, i) => (
                      <motion.div 
                        key={i}
                        className={`${method.bg} ${method.hover} p-6 rounded-xl shadow-md transition-all cursor-pointer flex items-start h-full border border-white hover:border-gray-200`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={method.action}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && method.action()}
                      >
                        <div className="bg-white p-3 rounded-full mr-4 shadow-sm flex-shrink-0">
                          {method.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">{method.title}</h3>
                          <p className="text-blue-600 font-medium">
                            {method.hideNumber ? method.text : method.text}
                          </p>
                          {method.subtext && <p className="text-gray-500 text-sm mt-1">{method.subtext}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Feedback Section */}
          <section className="mb-20 text-center">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12 shadow-lg border border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2 
                className="text-3xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Share Your <span className="text-blue-600">Feedback</span>
              </motion.h2>
              <motion.h3 
                className="text-xl text-gray-600 mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Your experience helps us improve our services
              </motion.h3>
              <motion.button 
                onClick={() => setShowModal(true)} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all flex items-center mx-auto group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <FaStar className="mr-2 group-hover:animate-pulse" />
                Give Feedback
              </motion.button>
            </motion.div>
          </section>

          {/* Callback Request Modal */}
          {showCallbackModal && (
            <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {callbackSuccess ? (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6 }}
                    >
                      <FaPhoneAlt className="text-green-500 text-5xl mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                    <p className="text-gray-600">Our team will contact you shortly.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-6 text-center text-blue-600">Request a Callback</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input
                          name="name"
                          value={callbackForm.name}
                          onChange={handleCallbackInputChange}
                          placeholder="John Doe"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          name="phoneNumber"
                          value={callbackForm.phoneNumber}
                          onChange={handleCallbackInputChange}
                          placeholder="+91 9876543210"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                          type="tel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Query</label>
                        <textarea
                          name="query"
                          value={callbackForm.query}
                          onChange={handleCallbackInputChange}
                          placeholder="Describe your service needs..."
                          rows="4"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-3">
                      <button
                        onClick={() => setShowCallbackModal(false)}
                        className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitCallback}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          "Submit Request"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}

          {/* Feedback Modal */}
          {showModal && (
            <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {submitSuccess ? (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6 }}
                    >
                      <FaStar className="text-yellow-500 text-5xl mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                    <p className="text-gray-600">Your feedback helps us serve you better.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-6 text-center text-blue-600">Share Your Experience</h3>
                    <div className="space-y-4">
                      {/* Star Rating */}
                      <div className="flex justify-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className="text-3xl focus:outline-none mx-1 transform hover:scale-110 transition-transform"
                            onMouseEnter={() => setFeedback(prev => ({ ...prev, hover: star }))}
                            onMouseLeave={() => setFeedback(prev => ({ ...prev, hover: feedback.rating }))}
                            onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                            aria-label={`Rate ${star} star`}
                          >
                            <FaStar
                              className={`${(feedback.hover || feedback.rating) >= star ? 'text-yellow-500' : 'text-gray-300'} drop-shadow-sm`}
                            />
                          </button>
                        ))}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Optional)</label>
                        <input
                          name="name"
                          value={feedback.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your City (Optional)</label>
                        <input
                          name="city"
                          value={feedback.city}
                          onChange={handleInputChange}
                          placeholder="Mumbai"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback*</label>
                        <textarea
                          name="message"
                          value={feedback.message}
                          onChange={handleInputChange}
                          placeholder="Share your experience with our services..."
                          rows="4"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitFeedback}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
                        disabled={isSubmitting || feedback.rating === 0}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          "Submit Feedback"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}

          {/* Emergency CTA Section */}
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500 rounded-full opacity-20"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-400 rounded-full opacity-10"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Need Immediate Assistance?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto relative z-10">
              Our emergency response team is standing by 24/7 to help with urgent home service needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <motion.button
                onClick={handleCall}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center justify-center">
                  <FaPhoneAlt className="mr-2" />
                  Call Emergency Hotline
                </div>
              </motion.button>
              <motion.button
                onClick={handleWhatsApp}
                className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:bg-green-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center justify-center">
                  <FaWhatsapp className="mr-2" />
                  WhatsApp Support
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    </>
  );
};
export default Contact;