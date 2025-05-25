// AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create the AuthContext
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();

  // Load token from localStorage when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // You may decode token here or fetch user details using a /me endpoint
      setAuthUser({ token });
    }
  }, []);

  // Login function
  const login = (token) => {
    localStorage.setItem("token", token);
    setAuthUser({ token });
  };
  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("https://fixease.onrender.com/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      localStorage.removeItem("token");
      setAuthUser(null);
      navigate("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Provide authUser, login, and logout to children components
  return (
    <AuthContext.Provider value={{ authUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
