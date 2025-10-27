import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import Pagination from '../common/Pagination';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    departmentId: '',
    positionId: '',
    hireDate: '',
    terminationDate: '',
    probationEndDate: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    positionLevel: '',
    customPositionLevel: ''
  });
  const [error, setError] = useState(null);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positionsError, setPositionsError] = useState(null);

  const positionLevels = ['Junior', 'Mid', 'Senior', 'Lead'];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching data with:', { currentPage, pageSize, searchTerm });
      
      const [employeesResponse, departmentsResponse, positionsResponse] = await Promise.all([
        axiosInstance.get(`/api/employee/search?page=${currentPage - 1}&size=${pageSize}&query=${searchTerm}`),
        axiosInstance.get('/api/department/all', {
          params: {
            page: 0,
            size: 100
          }
        }),
        axiosInstance.get('/api/position/all', {
          params: {
            page: 0,
            size: 100
          }
        })
      ]);

      console.log('Employees response:', employeesResponse.data);
      
      if (!employeesResponse.data.content) {
        console.error('Invalid employees response:', employeesResponse.data);
        setError('Invalid response format from server');
        return;
      }

      setEmployees(employeesResponse.data.content);
      setTotalPages(employeesResponse.data.totalPages);
      setDepartments(departmentsResponse.data.content || []); 
      setPositions(positionsResponse.data.content || []); 
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 404) {
        setError('No data found. The database might be empty.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this data.');
      } else {
        setError('Failed to load data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  // Handle search input changes with debounce
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Effect to fetch data with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchData, searchTerm, currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get admin ID from user context
      const userStr = localStorage.getItem('user');
      console.log('User data from localStorage:', userStr);

      if (!userStr) {
        throw new Error('User not found. Please login again.');
      }

      const user = JSON.parse(userStr);
      if (!user.token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Decode JWT token to get user email
      const tokenPayload = JSON.parse(atob(user.token.split('.')[1]));
      console.log('Token payload:', tokenPayload);
      
      // Get user details from backend
      const userResponse = await axiosInstance.get(`/api/user/email/${encodeURIComponent(tokenPayload.sub)}`);
      
      if (!userResponse.data?.userId) {
        throw new Error('Failed to get user details. Please login again.');
      }

      const adminId = userResponse.data.userId;

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.departmentId || !formData.positionId) {
        throw new Error('All required fields must be filled');
      }

      // Use custom level if provided, otherwise use selected level
      const positionLevel = formData.customPositionLevel || formData.positionLevel;
      if (!positionLevel) {
        throw new Error('Position level is required');
      }

      const employeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : null,
        gender: formData.gender,
        hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString().split('T')[0] : null,
        terminationDate: formData.terminationDate ? new Date(formData.terminationDate).toISOString().split('T')[0] : null,
        probationEndDate: formData.probationEndDate ? new Date(formData.probationEndDate).toISOString().split('T')[0] : null,
        status: formData.status,
        positionLevel: positionLevel
      };

      await axiosInstance.post('/api/employee/save', employeeData, {
        params: {
          departmentId: formData.departmentId,
          positionId: formData.positionId,
          adminId: adminId
        }
      });

      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'Male',
        departmentId: '',
        positionId: '',
        positionLevel: '',
        customPositionLevel: '',
        hireDate: '',
        terminationDate: '',
        probationEndDate: '',
        status: 'ACTIVE'
      });
      fetchData();
    } catch (error) {
      console.error('Error adding employee:', error);
      alert(error.message || 'Failed to add employee');
    }
  };

  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    console.log('Form change:', { name, value, currentFormData: formData }); // Debug log
    
    // If changing position level or custom level, clear the other one
    if (name === 'positionLevel' && value) {
      const newFormData = {
        ...formData,
        positionLevel: value,
        customPositionLevel: '' // Clear custom level when selecting predefined level
      };
      console.log('Setting position level:', newFormData); // Debug log
      setFormData(newFormData);
    } else if (name === 'customPositionLevel' && value) {
      const newFormData = {
        ...formData,
        customPositionLevel: value,
        positionLevel: '' // Clear predefined level when typing custom level
      };
      console.log('Setting custom level:', newFormData); // Debug log
      setFormData(newFormData);
    } else if (name === 'positionId') {
      // When position changes, reset both position level fields
      const newFormData = {
        ...formData,
        [name]: value,
        positionLevel: '',
        customPositionLevel: ''
      };
      console.log('Position changed:', newFormData); // Debug log
      setFormData(newFormData);
    } else {
      const newFormData = {
        ...formData,
        [name]: value
      };
      console.log('Other field changed:', newFormData); // Debug log
      setFormData(newFormData);
    }
  };

  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    console.log('Department changed:', departmentId); // Debug log

    setFormData({
      ...formData,
      departmentId: departmentId,
      positionId: '', // Clear position when department changes
      positionLevel: '',
      customPositionLevel: ''
    });
    
    if (departmentId) {
      try {
        setPositionsLoading(true);
        setPositionsError(null);
        console.log('Fetching positions for department:', departmentId); // Debug log
        const response = await axiosInstance.get(`/api/position/department/${departmentId}`);
        console.log('Positions response:', response.data); // Debug log
        
        if (!Array.isArray(response.data)) {
          console.error('Invalid positions response:', response.data);
          setPositionsError('Failed to load positions. Invalid format received.');
          setPositions([]);
          return;
        }
        
        setPositions(response.data);
      } catch (error) {
        console.error('Error fetching positions:', error);
        setPositionsError('Failed to load positions. Please try again.');
        setPositions([]);
      } finally {
        setPositionsLoading(false);
      }
    } else {
      setPositions([]);
      setPositionsError(null);
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
      gender: employee.gender,
      departmentId: employee.department?.departmentId || '',
      positionId: employee.position?.positionId || '',
      hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
      terminationDate: employee.terminationDate ? new Date(employee.terminationDate).toISOString().split('T')[0] : '',
      probationEndDate: employee.probationEndDate ? new Date(employee.probationEndDate).toISOString().split('T')[0] : '',
      status: employee.status || 'ACTIVE',
      positionLevel: employee.position?.level || '',
      customPositionLevel: employee.position?.customLevel || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm('Are you sure you want to delete this employee? This action cannot be undone.');
      
      if (!confirmed) {
        return; // User cancelled the deletion
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found. Please login again.');
      }

      const user = JSON.parse(userStr);
      if (!user.token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Get user details from backend using email
      const userResponse = await axiosInstance.get(`/api/user/email/${encodeURIComponent(user.email)}`);
      
      if (!userResponse.data?.userId) {
        throw new Error('Failed to get user details. Please login again.');
      }

      const adminId = userResponse.data.userId;

      await axiosInstance.delete(`/api/employee/delete/${id}`, {
        params: { adminId }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.message.includes('foreign key constraint')) {
        alert('Cannot delete this employee because they have active contracts or other related records. Please remove those first.');
      } else {
        alert(error.message || 'Failed to delete employee');
      }
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Employees</h1>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-64 px-3 py-2 border rounded-lg"
                disabled={loading}
              />
              <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            <button
              onClick={handleAddEmployee}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <FaPlus />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No employees to display
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-64 px-3 py-2 border rounded-lg"
              disabled={loading}
            />
            <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
          </div>
          <button
            onClick={handleAddEmployee}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            <FaPlus />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.empId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.firstName} {employee.lastName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.department?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.position?.title} - {employee.position?.level}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FaEdit className="inline-block" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.empId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline-block" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
              disabled={loading}
            />
          </div>
        </>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Employee</h3>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="col-span-2">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Personal Information</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                      placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleFormChange}
                      className="border rounded p-2 w-full"
                      required
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                      placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleFormChange}
                      className="border rounded p-2 w-full"
                      required
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                      placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleFormChange}
                      className="border rounded p-2 w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="border rounded p-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleFormChange}
                      className="border rounded p-2 w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Employee's date of birth</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormChange}
                      className="border rounded p-2 w-full"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* Employment Information */}
                  <div className="col-span-2">
                    <h4 className="text-md font-medium text-gray-700 mb-2 mt-4">Employment Information</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleDepartmentChange}
                      className="border rounded p-2 w-full"
                      required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                        <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                    <div className="relative">
                      <select
                        name="positionId"
                        value={formData.positionId}
                        onChange={handleFormChange}
                        className="border rounded p-2 w-full"
                        required
                        disabled={positionsLoading || !formData.departmentId}
                      >
                        <option value="">
                          {positionsLoading 
                            ? "Loading positions..." 
                            : !formData.departmentId 
                              ? "Select a department first"
                              : "Select Position"
                          }
                        </option>
                        {Array.isArray(positions) && positions.map((pos) => (
                          <option key={pos.positionId} value={pos.positionId}>
                            {pos.title} - {pos.level}
                          </option>
                        ))}
                      </select>
                      {positionsError && (
                        <p className="text-red-500 text-sm mt-1">{positionsError}</p>
                      )}
                      {formData.positionId && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position Level *</label>
                          <select
                            name="positionLevel"
                            value={formData.positionLevel}
                            onChange={handleFormChange}
                            className="border rounded p-2 w-full"
                          >
                            <option value="">Select Level</option>
                            {positionLevels.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Or Custom Level</label>
                            <input
                              type="text"
                              name="customPositionLevel"
                              placeholder="Type custom level"
                              value={formData.customPositionLevel}
                              onChange={handleFormChange}
                              className="border rounded p-2 w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
                    <input
                      type="date"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={handleFormChange}
                      className="border rounded p-2 w-full"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Date when employee starts working</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Probation End Date</label>
                    <input
                      type="date"
                      name="probationEndDate"
                      value={formData.probationEndDate}
                      onChange={handleFormChange}
                      className="border rounded p-2 w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">When probation period ends (usually 3-6 months after hire date)</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Termination Date</label>
                    <input
                      type="date"
                      name="terminationDate"
                      value={formData.terminationDate}
                      onChange={handleFormChange}
                      className="border rounded p-2 w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Only fill this if the employee is leaving/has left the company</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-200 px-4 py-2 rounded text-gray-800 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700"
                  >
                    Save
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

export default Employees;
