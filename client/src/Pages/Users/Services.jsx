import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBolt,
  FaTools,
  FaWater,
  FaBroom,
  FaHammer,
  FaWrench,
  FaChevronRight,
  FaRegClock,
} from 'react-icons/fa';


const Services = () => {
  const [services, setServices] = useState([]);
  const [groupedServices, setGroupedServices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const navigate = useNavigate();

  const serviceIcons = {
    Electrical: <FaBolt className="text-blue-500" />,
    Plumbing: <FaWater className="text-blue-500" />,
    Cleaning: <FaBroom className="text-blue-500" />,
    Carpentry: <FaHammer className="text-blue-500" />,
    Repair: <FaWrench className="text-blue-500" />,
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('https://fixease.onrender.com/api/services');
        setServices(response.data);
        groupServicesByCategory(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch services');
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const groupServicesByCategory = (services) => {
    const grouped = services.reduce((acc, service) => {
      const category = service.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {});
    setGroupedServices(grouped);
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

const handleBookNow = (service) => {
  // Check if user is logged in (you might have this in localStorage or context)
  const isLoggedIn = localStorage.getItem('token'); // or your auth token
  
  if (!isLoggedIn) {
    navigate('/login', { state: 
      { 
        from: '/services' } });
  } else {
    navigate(`/book-service/${service._id}`, { 
      state: { 
        service,
        from: '/services'
      } 
    });
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-600">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaWrench className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Quality <span className="text-blue-600">Home Services</span> On Demand
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Book trusted professionals for all your home needs. Satisfaction guaranteed.
          </p>
        </motion.div>

        {Object.keys(groupedServices).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedServices).map(([category, services]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex justify-between items-center p-6 md:p-8 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      {serviceIcons[category] || <FaTools className="text-gray-500" />}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{category}</h2>
                  </div>
                  <FaChevronRight
                    className={`text-gray-500 transition-transform ${
                      expandedCategory === category ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {expandedCategory === category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="px-6 md:px-8 pb-6 md:pb-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.map((service) => (
                        <motion.div
                          key={service._id}
                          whileHover={{ y: -5 }}
                          className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all"
                        >
                          <div className="relative h-48 overflow-hidden">
                            {service.image && (
                              <img
                                src={`https://fixease.onrender.com/${service.image}`}
                                alt={service.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            <span
                              className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full ${
                                service.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {service.status || 'Available'}
                            </span>
                          </div>

                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {service.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <FaRegClock className="mr-1" />
                                  {service.duration || '1-2 hours'}
                                </p>
                                <p className="text-xl font-bold text-gray-900 mt-1">
                                  ₹{service.price}
                                  <span className="text-sm font-normal text-gray-500 ml-1">starting</span>
                                </p>
                              </div>

                              <button
                                onClick={() => handleBookNow(service)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                              >
                                <span>Book Now</span>
                                <FaChevronRight className="ml-2 text-xs" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTools className="text-blue-500 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Services Available</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We're currently updating our service offerings. Please check back soon!
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Us
              <FaChevronRight className="ml-2" />
            </Link>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Need something special?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            We offer custom solutions for unique home service needs. Our professionals are ready to help with any request.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Contact Us
          </Link>
        </motion.div>
      </section>

    </div>
  );
};

export default Services;