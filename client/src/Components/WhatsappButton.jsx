import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Clock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const WhatsAppButton = ({
  phoneNumber = "918789494772",
  predefinedMessage = `Hello Fixease Team 👋,\n\nI have a few questions:\n\n1. What is Fixease?\n2. How can I book a service?\n3. Are your technicians verified?\n4. What are your service hours?\n5. How can I track my booking?\n\nThanks!`,
  hideOnRoutes = ["/admin", "/dashboard", "/login"],
  businessHours = { open: 9, close: 21, days: [1, 2, 3, 4, 5, 6] }, // Mon-Sat 9AM-9PM
  timezoneOffset = 5.5, // IST
  supportEmail = "support@fixease.com",
  className = "",
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);

  // Check business hours and day
  useEffect(() => {
    const checkAvailability = () => {
      const now = new Date();
      const utcHours = now.getUTCHours() + timezoneOffset;
      const currentHour = utcHours % 24;
      const day = now.getUTCDay(); // 0-6 (Sunday-Saturday)
      setCurrentDay(day);

      const isWithinHours = currentHour >= businessHours.open && currentHour < businessHours.close;
      const isWorkingDay = businessHours.days?.includes(day) ?? true;
      
      setIsAvailable(isWithinHours && isWorkingDay);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [businessHours, timezoneOffset]);

  // Hide on specified routes
  if (hideOnRoutes.some(route => location.pathname.startsWith(route))) {
    return null;
  }

  const encodedMessage = encodeURIComponent(predefinedMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  const handleClick = (e) => {
    if (!isAvailable) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] ${className}`}>
      {/* Main Button */}
      <motion.div
        className="relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.a
          href={isAvailable ? whatsappUrl : "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 ${
            isAvailable ? 'bg-[#25D366] hover:bg-[#128C7E]' : 'bg-gray-400 hover:bg-gray-500'
          } text-white px-4 py-3 rounded-full shadow-lg transition-all cursor-pointer`}
          aria-label={isAvailable ? "Chat on WhatsApp" : "Customer support unavailable"}
        >
          <MessageCircle size={20} />
          <span className="hidden sm:inline whitespace-nowrap">
            {isAvailable ? "Chat with Us" : "Leave a Message"}
          </span>
        </motion.a>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-2 right-0 bg-gray-800 text-white text-sm rounded-md py-2 px-3 whitespace-nowrap shadow-lg"
            >
              {isAvailable ? (
                "We're online now!"
              ) : (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>Back at {businessHours.open}:00 AM</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Unavailable Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} className="text-yellow-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {businessHours.days?.includes(currentDay) 
                    ? "Outside Business Hours" 
                    : "Weekend Support"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {businessHours.days?.includes(currentDay) ? (
                    <>
                      Our team is currently unavailable. We're open from{" "}
                      <span className="font-medium">{businessHours.open}:00 AM</span> to{" "}
                      <span className="font-medium">{businessHours.close}:00 PM</span> on{" "}
                      {businessHours.days?.map(d => dayNames[d]).join(", ")}.
                    </>
                  ) : (
                    "Our team is currently offline for the weekend. We'll respond on Monday."
                  )}
                </p>

                <div className="space-y-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>Send WhatsApp Message Anyway</span>
                  </a>

                  {supportEmail && (
                    <a
                      href={`mailto:${supportEmail}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Mail size={18} />
                      <span>Email Us Instead</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppButton;