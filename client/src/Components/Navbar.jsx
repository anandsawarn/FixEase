import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { 
  FiUser, 
  FiMenu, 
  FiLogIn, 
  FiLogOut, 
  FiUserPlus
} from "react-icons/fi";

const Navbar = () => {
  const { authUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sticky, setSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Sticky effect
  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close logout dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#user-dropdown")) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/services", label: "Services" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        sticky
          ? "shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          : "bg-white dark:bg-slate-800"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Menu Button */}
          <div className="flex items-center">
            <button
              className="md:hidden text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600 dark:text-blue-400 ml-2 hover:opacity-80 transition-opacity"
            >
              FixEase
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Controls */}
          <div className="flex items-center space-x-4">
            {authUser ? (
              <div className="relative" id="user-dropdown">
                <button
                  onClick={() => setShowLogout((prev) => !prev)}
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="User menu"
                >
                  <FiUser className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>

                {showLogout && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-slate-600">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <FiLogIn />
                  <span className="hidden md:inline">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center space-x-1 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 px-4 py-2 rounded-md transition-colors"
                >
                  <FiUserPlus />
                  <span className="hidden md:inline">Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-800 shadow-lg rounded-b-lg transition-all">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;