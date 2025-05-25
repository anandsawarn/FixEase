import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('https://fixease.onrender.com/api/testimonials/');
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        const result = await response.json();
        setTestimonials(result.data || []); // Handle case where data might be undefined
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-8"></div>
            <div className="bg-white rounded-xl shadow-lg p-8 h-64">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-gray-300 rounded-full mx-1"></div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 mx-auto"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6 mx-auto"></div>
              </div>
              <div className="mt-8 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
                <div className="h-3 bg-gray-300 rounded w-1/6 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-gray-600">No testimonials available yet.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            What <span className="text-blue-600">Customers</span> Say
          </h2>
          <p className="text-lg text-gray-600">
            Hear from people who have experienced our exceptional service
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <div className="relative">
          <motion.div
            key={testimonials[current]._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 md:p-10"
          >
            <div className="text-center">
              {/* Rating Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`text-2xl mx-1 transition-all duration-200 ${
                      i < (testimonials[current].rating || 0) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial Message */}
              <blockquote className="mb-8">
                <p className="text-lg md:text-xl italic text-gray-700 leading-relaxed">
                  "{testimonials[current].message || 'No message provided'}"
                </p>
              </blockquote>

              {/* Customer Info */}
              <div className="space-y-1">
                <p className="font-semibold text-gray-900 text-lg">
                  {testimonials[current].name || 'Anonymous'}
                </p>
                <p className="text-blue-600 text-sm">
                  {testimonials[current].city || 'Unknown location'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 bg-white p-3 rounded-full shadow-md hover:bg-blue-50 transition-colors duration-200"
                aria-label="Previous testimonial"
              >
                <FiChevronLeft className="w-5 h-5 text-blue-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 bg-white p-3 rounded-full shadow-md hover:bg-blue-50 transition-colors duration-200"
                aria-label="Next testimonial"
              >
                <FiChevronRight className="w-5 h-5 text-blue-600" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === current ? 'bg-blue-600 w-4' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Testimonials;