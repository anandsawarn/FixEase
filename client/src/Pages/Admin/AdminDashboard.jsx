import { useState, useEffect } from 'react';
import { 
  FaUsers, FaCheckCircle, FaClock, 
  FaMoneyBillWave, FaRupeeSign, FaHome, 
  FaClipboardList, FaCalendarAlt, FaExclamationTriangle 
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EMPLOYEE_API = "https://fixease.onrender.com/api/employees";
const SERVICE_API = "https://fixease.onrender.com/api/services";
const ACTIVE_SERVICE_API = "https://fixease.onrender.com/api/bookings";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [activeServices, setActiveServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesRes, servicesRes, activeServicesRes] = await Promise.all([
          axios.get(EMPLOYEE_API),
          axios.get(SERVICE_API),
          axios.get(ACTIVE_SERVICE_API)
        ]);
        
        setEmployees(employeesRes.data);
        setServices(servicesRes.data);
        setActiveServices(activeServicesRes.data?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    // Employee stats
    totalEmployees: employees.length,
    pendingPayments: employees.filter(e => e.salaryStatus === 'unpaid').length,
    completedPayments: employees.filter(e => e.salaryStatus === 'paid').length,
    totalSalaryPaid: employees
      .filter(e => e.salaryStatus === 'paid')
      .reduce((sum, emp) => sum + (emp.salary || 0), 0),
    
    // Service stats
    totalServices: services.length,
    activeServices: services.filter(s => s.status === 'active').length,
    inactiveServices: services.filter(s => s.status === 'inactive').length,
    
    // Active service bookings stats
    totalActiveBookings: activeServices.length,
    pendingBookings: activeServices.filter(s => s.status === 'pending').length,
    completedBookings: activeServices.filter(s => s.status === 'completed').length,
    cancelledBookings: activeServices.filter(s => s.status === 'cancelled').length,
  };

  const goToUserHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 m-10 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={goToUserHome}
          className="bg-gray-200  hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <FaHome /> User Home
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 w-7xl md:grid-cols-3 gap-4">
        {/* Employee Stats */}
        <StatCard 
          icon={<FaUsers className="text-blue-500" />}
          title="Total Employees"
          value={stats.totalEmployees}
          bgColor="bg-blue-50"
        />
        <StatCard 
          icon={<FaClock className="text-yellow-500" />}
          title="Pending Payments"
          value={stats.pendingPayments}
          bgColor="bg-yellow-50"
        />
        <StatCard 
          icon={<FaMoneyBillWave className="text-teal-500" />}
          title="Completed Payments"
          value={stats.completedPayments}
          bgColor="bg-teal-50"
        />
        <StatCard 
          icon={<FaRupeeSign className="text-indigo-500" />}
          title="Total Salary Paid to Employees"
          value={`₹${stats.totalSalaryPaid.toLocaleString()}`}
          bgColor="bg-indigo-50"
        />

        {/* Service Stats */}
        <StatCard 
          icon={<FaClipboardList className="text-orange-500" />}
          title="List of  Services"
          value={stats.totalServices}
          bgColor="bg-orange-50"
        />

        {/* Active Service Bookings */}
        <StatCard 
          icon={<FaCalendarAlt className="text-purple-500" />}
          title="Total Active Bookings"
          value={stats.totalActiveBookings}
          bgColor="bg-purple-50"
        />
        <StatCard 
          icon={<FaClock className="text-amber-500" />}
          title="Pending Bookings"
          value={stats.pendingBookings}
          bgColor="bg-amber-50"
        />
        <StatCard 
          icon={<FaCheckCircle className="text-emerald-500" />}
          title="Completed Bookings"
          value={stats.completedBookings}
          bgColor="bg-emerald-50"
        />
        <StatCard 
          icon={<FaExclamationTriangle className="text-rose-500" />}
          title="Cancelled Bookings"
          value={stats.cancelledBookings}
          bgColor="bg-rose-50"
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, bgColor }) => (
  <div className={`${bgColor} p-4 rounded-lg shadow hover:shadow-md transition-shadow`}>
    <div className="flex items-center">
      <div className="p-3 mr-4 rounded-full bg-white shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-sm text-gray-600">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

export default AdminDashboard;