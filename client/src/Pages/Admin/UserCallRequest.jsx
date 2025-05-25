import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiFilter, FiRefreshCw, FiChevronUp, FiChevronDown, 
  FiClock, FiCheckCircle, FiAlertCircle, FiSearch,
  FiUser, FiPhone, FiMessageSquare, FiCalendar, FiEdit
} from 'react-icons/fi';

const UserCallRequest = () => {
  // State management
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Status options with icons
  const statusOptions = [
    { value: 'all', label: 'All', icon: <FiFilter className="mr-1" />, color: 'gray' },
    { value: 'pending', label: 'Pending', icon: <FiClock className="mr-1" />, color: 'yellow' },
    { value: 'resolved', label: 'Resolved', icon: <FiCheckCircle className="mr-1" />, color: 'green' }
  ];

  // Fetch requests from API
  const fetchRequests = async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
      const response = await axios.get('https://fixease.onrender.com/api/user-queries/get-all-queries');
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Update request status
  const updateRequestStatus = async (id, status) => {
    const originalRequests = [...requests];
    try {
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request._id === id
            ? {
                ...request,
                attended: status === 'resolved',
                updatedAt: new Date().toISOString(),
                resolvedAt: status === 'resolved' ? new Date().toISOString() : null
              }
            : request
        )
      );

      await axios.patch(`https://fixease.onrender.com/api/user-queries/update-query/${id}/status`, {
        status: status === 'resolved' ? 'resolved' : 'pending'
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setRequests(originalRequests);
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

  // Filter and sort requests
  const getFilteredAndSortedRequests = () => {
    let filteredRequests = [...requests];

    // Apply status filter
    if (filter === 'pending') {
      filteredRequests = filteredRequests.filter(request => !request.attended);
    } else if (filter === 'resolved') {
      filteredRequests = filteredRequests.filter(request => request.attended);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredRequests = filteredRequests.filter(request =>
        request.name.toLowerCase().includes(query) ||
        request.phoneNumber.includes(query) ||
        request.query.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filteredRequests.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filteredRequests;
  };

  // Sort indicator component
  const SortIndicator = ({ sortKey }) => (
    sortConfig.key === sortKey ? (
      sortConfig.direction === 'asc' ? (
        <FiChevronUp className="ml-1 inline" />
      ) : (
        <FiChevronDown className="ml-1 inline" />
      )
    ) : null
  );

  // Initial data fetch
  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = getFilteredAndSortedRequests();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm max-w-md w-full mx-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium text-gray-800">Loading call requests</h3>
          <p className="mt-2 text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm max-w-md w-full mx-4">
          <FiAlertCircle className="mx-auto text-red-500 text-4xl mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Requests</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Mobile card view
  const MobileRequestCard = ({ request }) => (
    <div className={`bg-white rounded-xl shadow-sm p-4 mb-4 border-l-4 ${request.attended ? 'border-green-500' : 'border-yellow-500'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
            <FiUser className="text-lg" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{request.name}</h3>
            <p className="text-sm text-gray-500 flex items-center">
              <FiPhone className="mr-1" />
              {request.phoneNumber}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          request.attended ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {request.attended ? 'Resolved' : 'Pending'}
        </span>
      </div>
      
      <div className="mb-3">
        <p className="text-gray-700 flex items-start">
          <FiMessageSquare className="flex-shrink-0 mt-1 mr-2 text-gray-400" />
          <span>{request.query}</span>
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
        <div className="flex items-center">
          <FiCalendar className="mr-1" />
          <span>{formatDateTime(request.createdAt)}</span>
        </div>
        {request.resolvedAt && (
          <div className="flex items-center">
            <FiCheckCircle className="mr-1" />
            <span>{formatDateTime(request.resolvedAt)}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setSelectedRequest(request)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          <FiEdit className="mr-1" /> Details
        </button>
        <select
          value={request.attended ? 'resolved' : 'pending'}
          onChange={(e) => updateRequestStatus(request._id, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            request.attended ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
    </div>
  );

  // Request detail modal
  const RequestDetailModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">Request Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiTimes className="text-xl" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                <FiUser className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{request.name}</h3>
                <p className="text-gray-600">{request.phoneNumber}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <FiMessageSquare className="mr-2" /> Query
              </h4>
              <p className="text-gray-600">{request.query}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FiCalendar className="mr-2" /> Created
                </h4>
                <p className="text-gray-600">{formatDateTime(request.createdAt)}</p>
              </div>
              
              {request.updatedAt && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FiEdit className="mr-2" /> Last Updated
                  </h4>
                  <p className="text-gray-600">{formatDateTime(request.updatedAt)}</p>
                </div>
              )}
              
              {request.resolvedAt && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FiCheckCircle className="mr-2" /> Resolved
                  </h4>
                  <p className="text-gray-600">{formatDateTime(request.resolvedAt)}</p>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={request.attended ? 'resolved' : 'pending'}
                onChange={(e) => {
                  updateRequestStatus(request._id, e.target.value);
                  onClose();
                }}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  request.attended ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Call Request Management</h1>
            <p className="text-gray-600 mt-2">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} found
            </p>
          </div>
          <div className="flex space-x-3 w-full md:w-auto">
            <button
              onClick={fetchRequests}
              disabled={isRefreshing}
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            >
              <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, phone or query..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filter === option.value
                        ? `bg-${option.color}-100 text-${option.color}-800`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isMobileView ? (
            <div className="p-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(request => (
                  <MobileRequestCard key={request._id} request={request} />
                ))
              ) : (
                <div className="text-center py-12">
                  <FiSearch className="mx-auto text-gray-400 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
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
                        Name
                        <SortIndicator sortKey="name" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiPhone className="mr-2 text-gray-400 inline" />
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiMessageSquare className="mr-2 text-gray-400 inline" />
                      Query
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('updatedAt')}
                    >
                      <div className="flex items-center">
                        <FiEdit className="mr-2 text-gray-400" />
                        Updated
                        <SortIndicator sortKey="updatedAt" />
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
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request._id} className={request.attended ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                              {request.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{request.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-sm text-gray-900 line-clamp-2">{request.query}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDateTime(request.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDateTime(request.updatedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.attended ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.attended ? 'Resolved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Details
                            </button>
                            <select
                              value={request.attended ? 'resolved' : 'pending'}
                              onChange={(e) => updateRequestStatus(request._id, e.target.value)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                request.attended ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <FiSearch className="mx-auto text-gray-400 text-4xl mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
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

      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)} 
        />
      )}
    </div>
  );
};

// Missing FiTimes component
const FiTimes = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default UserCallRequest;