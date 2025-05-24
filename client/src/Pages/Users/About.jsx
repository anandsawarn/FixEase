import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiDollarSign, FiClock, FiUsers, FiAward } from "react-icons/fi";
import { BiLeaf, BiHappyHeartEyes } from "react-icons/bi";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const About = () => {
  // State for testimonials data
  const [testimonials, setTestimonials] = useState([]);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats data
  const stats = [
    { value: "100+", label: "Skilled Professionals", icon: <FiUsers className="text-3xl" /> },
    { value: "24/7", label: "Customer Support", icon: <FiClock className="text-3xl" /> },
    { value: "98%", label: "Satisfaction Rate", icon: <BiHappyHeartEyes className="text-3xl" /> },
    { value: "5,000+", label: "Happy Customers", icon: <FiAward className="text-3xl" /> }
  ];

  // Fallback testimonials in case API fails
  const fallbackTestimonials = [
    { 
      name: "Anju Sharma", 
      feedback: "FixBase exceeded my expectations! Their service was incredibly fast, efficient, and highly professional.", 
      rating: 5,
      location: "Jalandhar"
    },
    { 
      name: "Neha", 
      feedback: "I love their eco-friendly approach. Highly recommended!", 
      rating: 5,
      location: "Ludhiana"
    },
    { 
      name: "Aditya Pathaniya", 
      feedback: "Affordable, reliable, and top-quality service!", 
      rating: 4,
      location: "Amritsar"
    }
  ];

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('https://fixease.onrender.com/api/testimonials/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match component structure
        const formattedTestimonials = data.data.map(item => ({
          name: item.name || 'Anonymous',
          feedback: item.message || 'No feedback provided',
          rating: item.rating || 5,
          location: item.city || 'Unknown location'
        }));
        
        setTestimonials(formattedTestimonials);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError(err.message);
        setTestimonials(fallbackTestimonials);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            Error loading testimonials: {error}. Showing fallback data instead.
          </p>
        </div>
      </div>
    </div>
  );

  // Testimonial card component
  const TestimonialCard = ({ review, index }) => (
    <motion.div
      className="bg-gray-50 p-6 rounded-lg h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            className={`${i < review.rating ? 'text-yellow-400' : 'text-gray-300'} mr-1`}
          />
        ))}
      </div>
      <FaQuoteLeft className="text-gray-300 text-2xl mb-4" />
      <p className="text-gray-700 italic mb-6">"{review.feedback}"</p>
      <div className="flex items-center mt-auto">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 flex items-center justify-center text-gray-500 font-bold">
          {review.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold">{review.name}</h4>
          <p className="text-gray-500 text-sm">{review.location}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              About <span className="text-blue-600">FixBase</span>
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Your trusted partner for premium home services in Punjab. We deliver excellence through certified professionals and eco-friendly solutions.
            </motion.p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-blue-600 mb-3 flex justify-center">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex items-center gap-12">
              <motion.div 
                className="lg:w-1/2 mb-10 lg:mb-0"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  Founded in 2018, FixBase began with a simple mission: to make home maintenance hassle-free for families in Punjab.
                </p>
                <p className="text-gray-600 mb-4">
                  We recognized the gap in the market for reliable, transparent, and eco-conscious home services.
                </p>
                <p className="text-gray-600">
                  Our commitment to quality and customer satisfaction has earned us numerous accolades.
                </p>
              </motion.div>
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Our team at work" 
                  className="rounded-xl shadow-lg w-full h-auto"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl font-bold text-center text-gray-900 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Why Choose <span className="text-blue-600">FixBase</span>?
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Verified Professionals", 
                  description: "Every technician undergoes rigorous background checks and training.", 
                  icon: <FiCheckCircle className="text-blue-600 text-4xl mb-4" />,
                  bg: "bg-blue-50"
                },
                { 
                  title: "Eco-Friendly Solutions", 
                  description: "We use environmentally safe products and sustainable practices.", 
                  icon: <BiLeaf className="text-green-500 text-4xl mb-4" />,
                  bg: "bg-green-50"
                },
                { 
                  title: "Transparent Pricing", 
                  description: "No hidden charges. Get upfront quotes with detailed breakdowns.", 
                  icon: <FiDollarSign className="text-yellow-500 text-4xl mb-4" />,
                  bg: "bg-yellow-50"
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className={`${feature.bg} p-8 rounded-xl shadow-sm hover:shadow-md transition-all h-full`}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center">
                    {feature.icon}
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl font-bold text-center text-gray-900 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Customer <span className="text-blue-600">Testimonials</span>
            </motion.h2>

            {error && <ErrorState />}
            
            {isLoading ? (
              <LoadingState />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.slice(0, visibleReviews).map((review, index) => (
                    <TestimonialCard key={index} review={review} index={index} />
                  ))}
                </div>

                {visibleReviews < testimonials.length && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setVisibleReviews(prev => prev + 3)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Load More Testimonials
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Ready to Experience the FixBase Difference?
            </motion.h2>
            <motion.p
              className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join thousands of satisfied customers who trust us for their home service needs.
            </motion.p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;