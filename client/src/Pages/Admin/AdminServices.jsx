import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaImage } from 'react-icons/fa';

const AdminServices = () => {
  const [service, setService] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    status: 'active',
    image: null,
  });
  const [previewImage, setPreviewImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editServiceId, setEditServiceId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'Electrician',
    'Technician',
    'Plumber',
    'Cleaning',
    'Carpenter',
    'Painter',
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://fixease.onrender.com/api/services/');
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to fetch services');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setService((prev) => ({
      ...prev,
      image: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', service.title);
    formData.append('description', service.description);
    formData.append('price', service.price);
    formData.append('category', service.category);
    formData.append('status', service.status);
    if (service.image) {
      formData.append('image', service.image);
    }
    
    try {
      if (editServiceId) {
        await axios.put(`https://fixease.onrender.com/api/services/${editServiceId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Service updated successfully!');
      } else {
        if (!service.image) {
          toast.error('Please upload an image for new service');
          setIsSubmitting(false);
          return;
        }
        await axios.post('https://fixease.onrender.com/api/services/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Service added successfully!');
      }

      resetForm();
      fetchServices();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setService({
      title: '',
      description: '',
      price: '',
      category: '',
      status: 'active',
      image: null,
    });
    setPreviewImage('');
    setEditServiceId(null);
  };

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await axios.delete(`https://fixease.onrender.com/api/services/${id}`);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
      console.error('Error:', error);
    }
  };

  const editService = (serviceData) => {
    setService({
      title: serviceData.title || '',
      description: serviceData.description || '',
      price: serviceData.price || '',
      category: serviceData.category || '',
      status: serviceData.status || 'active',
      image: null,
    });
    setPreviewImage(serviceData.image ? `https://fixease.onrender.com/${serviceData.image}` : '');  
    setEditServiceId(serviceData._id);
    setShowModal(true);
  };

  const openAddServiceModal = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen  py-4  sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Service Management</h1>
            <p className="text-gray-600 mt-2">Add, edit, and manage your services</p>
          </div>
          <button
            onClick={openAddServiceModal}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            Add New Service
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                id="search"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {filteredServices.length === services.length 
                  ? `All Services (${services.length})` 
                  : `Filtered Services (${filteredServices.length}/${services.length})`}
              </h2>
              <div className="text-sm text-gray-500">
                {services.filter(s => s.status === 'active').length} Active • {services.filter(s => s.status === 'inactive').length} Inactive
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-700">No services found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search or add a new service</p>
                <button
                  onClick={openAddServiceModal}
                  className="mt-4 flex items-center mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200"
                >
                  <FaPlus className="mr-2" />
                  Add Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <div key={service._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
                    <div className="h-48 bg-gray-100 relative">
                      {service.image ? (
                        <img
                          src={`https://fixease.onrender.com/${service.image}`}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <FaImage size={48} />
                        </div>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                        service.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-800">{service.title}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2 line-clamp-2">{service.description}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">₹{service.price}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editService(service)}
                            className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteService(service._id)}
                            className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-200 rounded-xl shadow-xl w-full max-w-2xl mx-4 my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editServiceId ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={service.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="e.g. Professional Plumbing Service"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={service.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        rows="4"
                        placeholder="Describe the service..."
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          name="price"
                          value={service.price}
                          onChange={handleChange}
                          className="w-full px-4 pl-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter price"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={service.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={service.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image {!editServiceId && '*'}
                      </label>
                      <div className="mt-1 flex items-center">
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition-colors duration-200">
                          <span className="text-sm font-medium text-gray-700">
                            {service.image ? service.image.name : 'Choose Image'}
                          </span>
                          <input
                            type="file"
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                      </div>
                      {previewImage && (
                        <div className="mt-4 relative">
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="w-full h-48 object-contain border border-gray-200 rounded-lg" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setService(prev => ({...prev, image: null}));
                              setPreviewImage('');
                            }}
                            className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors duration-200 flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editServiceId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : editServiceId ? 'Update Service' : 'Add Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;