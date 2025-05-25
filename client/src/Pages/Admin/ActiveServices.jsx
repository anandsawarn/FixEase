import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiFilter, FiRefreshCw, FiChevronUp, FiChevronDown, 
  FiClock, FiCheckCircle, FiAlertCircle, FiSearch,
  FiUser, FiPhone, FiMessageSquare, FiCalendar,
  FiMapPin, FiMail, FiTrash2, FiTool
} from 'react-icons/fi';
import { motion } from 'framer-motion';

// API endpoints configuration
const API_BASE_URL = 'https://fixease.onrender.com/api';
const API_ENDPOINTS = {
  GET_BOOKINGS: `${API_BASE_URL}/bookings`,
  GET_SERVICES: `${API_BASE_URL}/services`,
  UPDATE_BOOKING: (id) => `${API_BASE_URL}/booking/${id}`,
  DELETE_BOOKING: (id) => `${API_BASE_URL}/booking/${id}`
};

const ActiveServices = () => {
  // State management
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ 
    key: 'createdAt', 
    direction: 'desc' 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Status options configuration
  const statusOptions = [
    { 
      value: 'pending', 
      label: 'Pending', 
      icon: <FiClock size={14} />, 
      bgColor: 'bg-amber-100', 
      textColor: 'text-amber-800' 
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      icon: <FiCheckCircle size={14} />, 
      bgColor: 'bg-green-100', 
      textColor: 'text-green-800' 
    },
    { 
      value: 'cancelled', 
      label: 'Cancelled', 
      icon: <FiAlertCircle size={14} />, 
      bgColor: 'bg-red-100', 
      textColor: 'text-red-800' 
    }
  ];

  // Calculate pending services count
  const pendingCount = bookings.filter(
    booking => booking?.status === 'pending'
  ).length;

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Main data fetching function
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
      
      const [bookingsResponse, servicesResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.GET_BOOKINGS),
        axios.get(API_ENDPOINTS.GET_SERVICES)
      ]);
      
      setBookings(
        Array.isArray(bookingsResponse.data?.data) 
          ? bookingsResponse.data.data 
          : []
      );
      setServices(
        Array.isArray(servicesResponse.data) 
          ? servicesResponse.data 
          : []
      );
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setBookings([]);
      setServices([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        API_ENDPOINTS.UPDATE_BOOKING(bookingId),
        { 
          status: newStatus,
          statusChangedAt: new Date().toISOString()
        }
      );
      
      setBookings(prev => 
        prev.map(b => b._id === bookingId ? response.data : b)
      );
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete booking
  const deleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      setLoading(true);
      await axios.delete(API_ENDPOINTS.DELETE_BOOKING(id));
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort functionality
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get service name by ID
  const getServiceName = (serviceId) => {
    if (!serviceId) return 'N/A';
    const id = serviceId._id ? serviceId._id : serviceId;
    const service = services.find(s => s._id === id);
    return service ? service.title : 'N/A';
  };

  // Filter and sort bookings
  const getFilteredAndSortedBookings = () => {
    let filteredBookings = [...bookings];

    // Apply status filter
    if (filter !== 'all') {
      filteredBookings = filteredBookings.filter(
        booking => booking?.status === filter
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredBookings = filteredBookings.filter(booking =>
        (booking?.name?.toLowerCase().includes(query)) ||
        (booking?.phoneNumber?.includes(query)) ||
        (booking?.email?.toLowerCase().includes(query)) ||
        (booking?.serviceId && getServiceName(booking.serviceId).toLowerCase().includes(query)) ||
        (booking?.pincode?.includes(query))
      );
    }

    // Apply sorting
    filteredBookings.sort((a, b) => {
      const aValue = a?.[sortConfig.key] ?? '';
      const bValue = b?.[sortConfig.key] ?? '';

      // Special handling for date fields
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'statusChangedAt') {
        const dateA = aValue ? new Date(aValue).getTime() : 0;
        const dateB = bValue ? new Date(bValue).getTime() : 0;
        
        if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      // Default comparison for other fields
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredBookings;
  };

  // Sort indicator component
  const SortIndicator = ({ sortKey }) => (
    sortConfig.key === sortKey ? (
      sortConfig.direction === 'asc' ? (
        <FiChevronUp className="ml-1 inline" size={14} />
      ) : (
        <FiChevronDown className="ml-1 inline" size={14} />
      )
    ) : null
  );

  const filteredBookings = getFilteredAndSortedBookings();

  // Status badge component
  const StatusBadge = ({ status }) => {
    const option = statusOptions.find(opt => opt.value === status) || statusOptions[0];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${option.bgColor} ${option.textColor}`}>
        {option.icon}
        <span className="ml-1">{option.label}</span>
      </span>
    );
  };

  // Booking Card Component for Mobile View
  const BookingCard = ({ booking }) => {
    const [status, setStatus] = useState(booking.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (e) => {
      const newStatus = e.target.value;
      setIsUpdating(true);
      const result = await updateBookingStatus(booking._id, newStatus);
      if (result.success) {
        setStatus(newStatus);
      } else {
        alert("Failed to update status: " + result.error);
      }
      setIsUpdating(false);
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl shadow-md p-5 mb-4 border-l-4 ${
          status === 'pending' ? 'border-yellow-500' :
          status === 'completed' ? 'border-green-500' :
          status === 'cancelled' ? 'border-red-500' : 'border-blue-500'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-sm">
              {booking.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{booking.name}</h3>
              <div className="text-sm text-gray-500">
                <div className="flex items-center">
                  <FiPhone className="mr-1" size={14} />
                  {booking.phoneNumber}
                </div>
                <div className="flex items-center">
                  <FiMail className="mr-1" size={14} />
                  {booking.email}
                </div>
              </div>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
        
        <div className="mb-4 space-y-3">
          <div className="flex items-start">
            <FiMapPin className="flex-shrink-0 mt-1 mr-2 text-gray-400" size={14} />
            <div>
              <p className="text-gray-700">{booking.address}</p>
              <p className="text-gray-500 text-sm">Pincode: {booking.pincode}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FiTool className="flex-shrink-0 mt-1 mr-2 text-gray-400" size={14} />
            <span className="text-gray-700">Service: {getServiceName(booking.serviceId)}</span>
          </div>
          
          {booking.additionalMessage && (
            <div className="flex items-start">
              <FiMessageSquare className="flex-shrink-0 mt-1 mr-2 text-gray-400" size={14} />
              <span className="text-gray-700">{booking.additionalMessage}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <FiCalendar className="mr-1" size={14} />
            <span>Created: {formatDateTime(booking.createdAt)}</span>
          </div>
          {booking.statusChangedAt && (
            <div className="flex items-center">
              <FiClock className="mr-1" size={14} />
              <span>Status Changed: {formatDateTime(booking.statusChangedAt)}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="relative">
            <select
              value={status}
              disabled={isUpdating}
              onChange={handleStatusChange}
              className={`appearance-none px-3 py-1.5 pr-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isUpdating ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiChevronDown size={16} />
            </div>
          </div>
          <button
            onClick={() => deleteBooking(booking._id)}
            className="flex items-center px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            <FiTrash2 className="mr-1" size={14} />
            Delete
          </button>
        </div>
      </motion.div>
    );
  };

  // Booking Row Component for Desktop View
  const BookingRow = ({ booking }) => {
    const [status, setStatus] = useState(booking.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (e) => {
      const newStatus = e.target.value;
      setIsUpdating(true);
      const result = await updateBookingStatus(booking._id, newStatus);
      if (result.success) {
        setStatus(newStatus);
      } else {
        alert("Failed to update status: " + result.error);
      }
      setIsUpdating(false);
    };

    return (
      <tr className={
        status === 'pending' ? 'bg-yellow-50 hover:bg-yellow-100' :
        status === 'completed' ? 'bg-green-50 hover:bg-green-100' :
        status === 'cancelled' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
      }>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
              {booking?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{booking?.name}</div>
              <div className="text-sm text-gray-500">
                <div className="flex items-center">
                  <FiPhone className="mr-1" size={14} />
                  {booking?.phoneNumber}
                </div>
                <div className="flex items-center">
                  <FiMail className="mr-1" size={14} />
                  {booking?.email}
                </div>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900">
            {booking?.address}
            <div className="text-gray-500 mt-1">Pincode: {booking?.pincode}</div>
            {booking?.additionalMessage && (
              <div className="text-gray-600 mt-2 flex items-start">
                <FiMessageSquare className="flex-shrink-0 mt-1 mr-2" size={14} />
                <span>{booking.additionalMessage}</span>
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900">
            {getServiceName(booking?.serviceId)}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-500">{formatDateTime(booking?.createdAt)}</div>
          {booking?.statusChangedAt && (
            <div className="text-xs text-gray-400 mt-1">
              Status changed: {formatDateTime(booking.statusChangedAt)}
            </div>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="relative">
            <select
              value={status}
              disabled={isUpdating}
              onChange={handleStatusChange}
              className={`appearance-none px-3 py-1.5 pr-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isUpdating ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiChevronDown size={16} />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-right text-sm font-medium">
          <button
            onClick={() => deleteBooking(booking?._id)}
            className="flex items-center px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <FiTrash2 className="mr-1" size={14} />
          </button>
        </td>
      </tr>
    );
  };

  // Loading state
  if (loading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="mt-6 text-xl font-semibold text-gray-800">Loading Bookings</h3>
          <p className="mt-2 text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-red-500 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center mx-auto"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Service Bookings Management
            </h1>
            <div className="flex items-center mt-2">
              <p className="text-gray-600">
                {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} found
              </p>
              {pendingCount > 0 && (
                <span className="ml-3 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium flex items-center">
                  <FiClock className="mr-1" size={12} />
                  {pendingCount} pending
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-3 w-full md:w-auto">
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full md:w-auto"
            >
              <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, phone, email, service or pincode..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 ${
                    filter === 'all' ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                >
                  <FiFilter size={14} />
                  <span className="ml-1">All</span>
                </button>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${option.bgColor} ${option.textColor} ${
                      filter === option.value ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                  >
                    {option.icon}
                    <span className="ml-1">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isMobileView ? (
            <div className="p-4">
              {filteredBookings.length > 0 ? (
                filteredBookings.map(booking => (
                  <BookingCard key={booking?._id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center">
                        <FiUser className="mr-2 text-gray-400" />
                        Name & Contact
                        <SortIndicator sortKey="name" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiMapPin className="mr-2 text-gray-400 inline" />
                      Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiTool className="mr-2 text-gray-400 inline" />
                      Service
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('createdAt')}
                    >
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 text-gray-400" />
                        Created
                        <SortIndicator sortKey="createdAt" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <BookingRow 
                        key={booking?._id} 
                        booking={booking}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiSearch className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveServices;