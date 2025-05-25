import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaTimes, FaSave, 
  FaRupeeSign, FaIdCard, FaCalendarAlt, FaClock, 
  FaInfoCircle, FaSearch, FaBars, FaFilter 
} from 'react-icons/fa';
import axios from 'axios';

const BASE_URL = "https://fixease.onrender.com/api/employees";

const getCurrentIndiaTime = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  const timeStr = now.toLocaleTimeString('en-IN', { 
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
  
  return {
    date: dateStr.replace(/\//g, '-'),
    time: timeStr,
    timestamp: now.toISOString(),
    monthYear: `${now.getMonth()+1}-${now.getFullYear()}`
  };
};

const isLastDayOfMonth = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return now.getMonth() !== tomorrow.getMonth();
};

const generateEmployeeId = () => {
  return 'EMP-' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

const initialFormData = {
  employeeId: '',
  name: '',
  phone: '',
  role: '',
  salary: '',
  aadhaar: '',
  paidAmount: 0,
  originalPaidAmount: 0,
  remainingAmount: 0,
  salaryStatus: 'unpaid',
  paymentHistory: []
};

const statusClasses = {
  paid: 'bg-green-100 text-green-800',
  partially_paid: 'bg-blue-100 text-blue-800',
  unpaid: 'bg-red-100 text-red-800'
};

const statusText = {
  paid: 'Paid',
  partially_paid: 'Partial',
  unpaid: 'Unpaid'
};

const ManageEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteIdInput, setDeleteIdInput] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const currentMonthName = useMemo(() => 
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), 
    []
  );

  const roles = useMemo(() => ['Electrician', 'Plumber', 'Carpenter', 'Cleaner'], []);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL);
      setEmployees(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching employees", err);
      setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const resetUnpaidStatuses = useCallback(async () => {
    try {
      await axios.put(`${BASE_URL}/reset`, { currentMonthYear });
      fetchEmployees();
    } catch (err) {
      console.error("Error resetting statuses", err);
    }
  }, [currentMonthYear, fetchEmployees]);

  useEffect(() => {
    const now = new Date();
    setCurrentMonthYear(`${now.getMonth()+1}-${now.getFullYear()}`);
    
    const lastReset = localStorage.getItem('lastSalaryReset');
    const today = new Date().toLocaleDateString();
    
    if (isLastDayOfMonth() && lastReset !== today) {
      resetUnpaidStatuses();
      localStorage.setItem('lastSalaryReset', today);
    }
  }, [resetUnpaidStatuses]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.includes(searchTerm);
      
      const matchesRole = filterRole === 'all' || employee.role === filterRole;
      const matchesStatus = filterStatus === 'all' || employee.salaryStatus === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchTerm, filterRole, filterStatus]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      let newData = { ...prev, [name]: value };
      
      if (name === 'paidAmount' || name === 'salary') {
        const paid = name === 'paidAmount' ? Number(value) : Number(prev.paidAmount);
        const salary = name === 'salary' ? Number(value) : Number(prev.salary);
        const remaining = salary - prev.originalPaidAmount - paid;
        
        newData = {
          ...newData,
          remainingAmount: remaining > 0 ? remaining : 0
        };
      }
      
      if (name === 'paidAmount' || name === 'salaryStatus') {
        const totalPaid = prev.originalPaidAmount + Number(newData.paidAmount);
        const fullSalary = Number(newData.salary);
        
        if (totalPaid >= fullSalary) {
          newData.salaryStatus = 'paid';
        } else if (totalPaid > 0) {
          newData.salaryStatus = 'partially_paid';
        } else {
          newData.salaryStatus = 'unpaid';
        }
      }
      
      return newData;
    });
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim() && !isEditing) {
      alert('Please enter employee name');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone) && !isEditing) {
      alert('Please enter a valid 10-digit phone number');
      return false;
    }
    if (isNaN(formData.salary) || formData.salary <= 0) {
      alert('Salary must be a positive number');
      return false;
    }
    if (!/^\d{4}\s?\d{4}\s?\d{4}$/.test(formData.aadhaar) && !isEditing) {
      alert('Please enter a valid 12-digit Aadhaar number');
      return false;
    }
    if (!formData.role && !isEditing) {
      alert('Please select a role');
      return false;
    }
    
    const newPayment = Number(formData.paidAmount);
    const totalPaid = formData.originalPaidAmount + newPayment;
    
    if (newPayment < 0) {
      alert('Payment amount cannot be negative');
      return false;
    }
    
    if (newPayment > (formData.salary - formData.originalPaidAmount)) {
      alert('Payment amount cannot exceed remaining salary');
      return false;
    }
    
    if (formData.salaryStatus === 'paid' && totalPaid < formData.salary) {
      alert('Status cannot be "Paid" unless full salary is paid');
      return false;
    }
    
    return true;
  }, [formData, isEditing]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const currentTime = getCurrentIndiaTime();
    const newPaymentAmount = Number(formData.paidAmount);
    const totalPaid = formData.originalPaidAmount + newPaymentAmount;
    
    try {
      if (isEditing) {
        const updatedEmployee = {
          salary: Number(formData.salary),
          salaryStatus: formData.salaryStatus,
          paidAmount: totalPaid,
          paymentHistory: [...formData.paymentHistory]
        };

        if (newPaymentAmount > 0) {
          updatedEmployee.paymentHistory.push({
            ...currentTime,
            amount: newPaymentAmount
          });
        }

        await axios.put(`${BASE_URL}/${formData._id}`, updatedEmployee);
      } else {
        const newEmployee = {
          employeeId: generateEmployeeId(),
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          salary: Number(formData.salary),
          aadhaar: formData.aadhaar.replace(/\s/g, ''),
          paidAmount: totalPaid,
          salaryStatus: formData.salaryStatus,
          paymentHistory: newPaymentAmount > 0 ? [{
            ...currentTime,
            amount: newPaymentAmount
          }] : []
        };
        await axios.post(BASE_URL, newEmployee);
      }

      fetchEmployees();
      setFormData(initialFormData);
      setIsModalOpen(false);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving employee", err);
      alert("Failed to save employee: " + (err.response?.data?.message || err.message));
    }
  }, [formData, isEditing, validateForm, fetchEmployees]);

  const editEmployee = useCallback((employee) => {
    setFormData({
      ...employee,
      aadhaar: employee.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3'),
      originalPaidAmount: employee.paidAmount,
      remainingAmount: employee.salary - employee.paidAmount,
      paidAmount: 0
    });
    setIsEditing(true);
    setIsModalOpen(true);
  }, []);

  const initiateDelete = useCallback((employee) => {
    setEmployeeToDelete(employee);
    setDeleteIdInput('');
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteIdInput !== employeeToDelete?.employeeId) {
      alert('Employee ID does not match. Deletion canceled.');
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/${employeeToDelete._id}`);
      fetchEmployees();
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting employee", err);
      alert("Failed to delete employee");
    }
  }, [deleteIdInput, employeeToDelete, fetchEmployees]);

  const SalaryStatusBadge = useCallback(({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
      {statusText[status]}
    </span>
  ), []);

  const EmployeeCard = useCallback(({ employee }) => (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{employee.name}</h3>
          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <FaIdCard className="text-blue-500" /> {employee.employeeId}
          </div>
        </div>
        <SalaryStatusBadge status={employee.salaryStatus} />
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Role:</span>
          <span className="ml-1 font-medium">{employee.role}</span>
        </div>
        <div>
          <span className="text-gray-500">Phone:</span>
          <span className="ml-1 font-medium">{employee.phone}</span>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Salary:</span>
          <span className="ml-1 font-medium flex items-center">
            <FaRupeeSign className="mr-1" /> {employee.salary.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Paid:</span>
          <span className="ml-1 font-medium flex items-center">
            <FaRupeeSign className="mr-1" /> {employee.paidAmount.toLocaleString()}
          </span>
        </div>
      </div>
      
      {employee.paymentHistory?.length > 0 && (
        <div className="mt-3 text-sm">
          <div className="text-gray-500">Last Payment:</div>
          <div className="flex items-center gap-1">
            <FaCalendarAlt className="text-gray-400" /> 
            {employee.paymentHistory[employee.paymentHistory.length - 1].date}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <FaClock className="text-gray-400" /> 
            {employee.paymentHistory[employee.paymentHistory.length - 1].time}
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => editEmployee(employee)}
          className={`px-3 py-1 rounded ${employee.salaryStatus === 'paid' ? 
            'bg-gray-200 text-gray-500 cursor-not-allowed' : 
            'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
          disabled={employee.salaryStatus === 'paid'}
        >
          <FaEdit />
        </button>
        <button
          onClick={() => initiateDelete(employee)}
          className="px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  ), [SalaryStatusBadge, editEmployee, initiateDelete]);

  const EmployeeModal = useMemo(() => (
    <div className="fixed inset-0 flex items-center justify-center p-2 z-50 bg-opacity-50">
      <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-xl  overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg sticky top-0 z-10">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Update Employee' : 'Add New Employee'}
          </h3>
          <button
            onClick={() => {
              setFormData(initialFormData);
              setIsModalOpen(false);
              setIsEditing(false);
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 cursor-not-allowed"
                readOnly
                disabled
              />
            </div>
          )}
          
          {!isEditing && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  pattern="[0-9]{10}"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhaar Number *</label>
                <input
                  type="text"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="1234 5678 9012"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Salary (₹) *</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
              disabled={isEditing && formData.salaryStatus === 'paid'}
            />
          </div>
          
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Status *</label>
                <select
                  name="salaryStatus"
                  value={formData.salaryStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formData.salaryStatus === 'paid'}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partially_paid">Partially Paid</option>
                  {formData.originalPaidAmount + Number(formData.paidAmount) >= formData.salary && (
                    <option value="paid">Paid</option>
                  )}
                </select>
              </div>
              
              {(formData.salaryStatus === 'unpaid' || formData.salaryStatus === 'partially_paid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.salaryStatus === 'partially_paid' ? 'Additional Payment (₹)' : 'Amount Paid (₹)'} *
                  </label>
                  <input
                    type="number"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    max={formData.salary - formData.originalPaidAmount}
                  />
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    <p>Previously paid: ₹{formData.originalPaidAmount.toLocaleString()}</p>
                    <p>This payment: ₹{formData.paidAmount.toLocaleString()}</p>
                    <p>New total paid: ₹{(formData.originalPaidAmount + Number(formData.paidAmount)).toLocaleString()}</p>
                    <p>Remaining: ₹{(formData.salary - formData.originalPaidAmount - Number(formData.paidAmount)).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Payment Status *</label>
              <select
                name="salaryStatus"
                value={formData.salaryStatus}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="unpaid">Unpaid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid</option>
              </select>
              
              {formData.salaryStatus !== 'unpaid' && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">Initial Amount Paid (₹) *</label>
                  <input
                    type="number"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    max={formData.salary}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total salary: ₹{formData.salary.toLocaleString()} | 
                    Remaining: ₹{(formData.salary - formData.paidAmount).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white py-4">
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormData);
                setIsModalOpen(false);
                setIsEditing(false);
              }}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? (
                <>
                  <FaSave className="mr-2" /> Update
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" /> Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  ), [formData, handleInputChange, handleSubmit, isEditing, roles]);

  const DeleteModal = useMemo(() => (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete employee <strong>{employeeToDelete?.name}</strong>? This action cannot be undone.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            To confirm, please enter the employee ID: <strong>{employeeToDelete?.employeeId}</strong>
          </p>
          <input
            type="text"
            value={deleteIdInput}
            onChange={(e) => setDeleteIdInput(e.target.value)}
            placeholder="Enter employee ID"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaTrash className="mr-2" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  ), [deleteIdInput, employeeToDelete, confirmDelete]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Employee Management</h1>
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                <FaInfoCircle /> Current month: {currentMonthName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 md:px-4 md:py-2 rounded flex items-center gap-2 transition-colors"
                onClick={() => {
                  setFormData(initialFormData);
                  setIsModalOpen(true);
                  setIsEditing(false);
                }}
              >
                <FaPlus className="text-xs md:text-sm" />
                <span className="hidden sm:inline">Add Employee</span>
              </button>
              <button 
                className="md:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Filters */}
      {mobileMenuOpen && (
        <div className="bg-white shadow-md md:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop Filters */}
        <div className="hidden md:flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Employee Count */}
        <div className="md:hidden mb-4 flex justify-between items-center">
          <h3 className="font-medium">
            Employees: <span className="text-blue-600">{filteredEmployees.length}</span>
          </h3>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-1 text-sm text-blue-600"
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Employees List */}
        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <FaIdCard className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No employees found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or add a new employee</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" /> Add Employee
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-1">
                          <FaIdCard className="text-blue-500" /> {employee.employeeId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <FaRupeeSign className="text-gray-400" /> {employee.salary.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-1">
                          <SalaryStatusBadge status={employee.salaryStatus} />
                          {employee.salaryStatus !== 'paid' && (
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Paid:</span>
                                <span>₹{employee.paidAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Due:</span>
                                <span>₹{(employee.salary - employee.paidAmount).toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.paymentHistory?.length > 0 ? (
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-gray-400" /> 
                              {employee.paymentHistory[employee.paymentHistory.length - 1].date}
                            </span>
                            <span className="flex items-center gap-1 text-xs">
                              <FaClock className="text-gray-400" /> 
                              {employee.paymentHistory[employee.paymentHistory.length - 1].time}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editEmployee(employee)}
                            className={`p-2 rounded-full ${employee.salaryStatus === 'paid' ? 
                              'text-gray-400 bg-gray-100 cursor-not-allowed' : 
                              'text-blue-600 bg-blue-100 hover:bg-blue-200'}`}
                            disabled={employee.salaryStatus === 'paid'}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => initiateDelete(employee)}
                            className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredEmployees.map(employee => (
                <EmployeeCard key={employee._id} employee={employee} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {isModalOpen && EmployeeModal}
      {deleteModalOpen && DeleteModal}
    </div>
  );
};

export default ManageEmployee;