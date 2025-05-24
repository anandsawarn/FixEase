import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
function Section1() {
  return (
    <div className='-my-8'>     
      {/* Hero Section */}
      <section className="relative overflow-hidden p-2">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 md:py-32 flex flex-col md:flex-row items-center">
          {/* Text Content */}
          <div className="md:w-1/2 mb-12 md:mb-0">
            <motion.h1 
              className="text-xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Professional <span className="text-blue-600">Home Services</span> On Demand
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Book trusted professionals for all your home service needs. Fast, reliable, and with a satisfaction guarantee.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                to="/services" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 mt-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Book a Service Now
              </Link>
            </motion.div>
          </div>

          {/* Image Content */}
          <div className="md:w-1/2 flex justify-center">
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Home Services" 
                className="rounded-xl shadow-2xl w-full max-w-md"
              />
            
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Section1;