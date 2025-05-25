import React, { useState, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState(localStorage.getItem('rememberMe') ? localStorage.getItem('email') : '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');
  const { login } = useContext(AuthContext);

  // Forgot Password Modal States
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://fixease.onrender.com/api/users/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        login(user, token);

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('email', email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('email');
        }

        window.location.href = '/';
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      setResetLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://fixease.onrender.com/api/users/forget-password', {
        email: resetEmail,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setResetSuccess('Password reset successful. You can now log in.');
        setTimeout(() => {
          setShowModal(false);
          setResetEmail('');
          setNewPassword('');
          setConfirmPassword('');
        }, 2000);
      } else {
        setResetError(response.data.message || 'Reset failed.');
      }
    } catch (err) {
      setResetError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div 
      className="flex flex-col min-h-screen p-4 relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>

      <div className="flex-grow flex justify-center items-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden w-full max-w-md"
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.h2 className="text-3xl font-bold text-gray-800">Welcome Back</motion.h2>
              <p className="text-gray-600 mt-2">Sign in to manage your home services</p>
            </div>

            {error && <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff className="text-gray-500" /> : <FiEye className="text-gray-500" />}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <motion.button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </form>

            <div className="px-8 py-4 bg-gray-50 text-center">
              <p className="text-gray-600 text-sm">
                Don’t have an account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-950 bg-opacity-50 flex justify-center items-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              <FiX size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">Reset Password</h3>
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm text-gray-700">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {resetError && <p className="text-sm text-red-500 mb-2">{resetError}</p>}
              {resetSuccess && <p className="text-sm text-green-600 mb-2">{resetSuccess}</p>}
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Login;
