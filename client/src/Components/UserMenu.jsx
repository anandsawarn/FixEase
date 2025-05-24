import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { AuthContext } from "../App"; // Adjust the import path if needed

const UserMenu = () => {
  const { isLoggedIn, username, logout } = useContext(AuthContext);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userRef = useRef(null);
  const navigate = useNavigate();

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative hidden lg:block" ref={userRef}>
      <button
        onClick={toggleUserDropdown}
        className="text-gray-700 hover:text-blue-600 transition-all duration-300"
      >
        <FiUser className="text-2xl" />
      </button>

      {isUserDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-100 rounded-lg py-2 z-50">
          {isLoggedIn ? (
            <>
              <p className="block px-4 py-2 text-gray-700">
                Logged in as <strong>{username}</strong>
              </p>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;