import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = [
    {
      title: "Support",
      links: [
        { name: "Help Center", path: "/contact" }
      ]
    },
    {
      title: "About",
      links: [
        { name: "About Us", path: "/about" }
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Updated Grid to 4 Columns on Large Screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Footer Links */}
          {footerLinks.map((column, index) => (
            <div key={index} className="mb-6 md:mb-0">
              <h4 className="text-md font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.path} 
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h4 className="text-md font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <FiMail className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">support@fixease.com</span>
              </li>
              <li className="flex items-start">
                <FiPhone className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+91 98765 43210</span>
              </li>
            </ul>
          </div>

          {/* Location Info */}
          <div>
            <h4 className="text-md font-semibold mb-4">Location</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <FiMapPin className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">123 Service Lane, Bangalore, India 560001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center space-x-4 mb-6">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <FaFacebook className="text-lg" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <FaTwitter className="text-lg" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <FaInstagram className="text-lg" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <FaLinkedin className="text-lg" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <FaYoutube className="text-lg" />
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} FixEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
