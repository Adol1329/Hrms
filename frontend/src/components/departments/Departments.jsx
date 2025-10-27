import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import Pagination from '../common/Pagination';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    employeeCount: 0,
    positionCount: 0
  });

  // Fetch paginated data with search
  const fetchData = async (page = 1, searchTerm = '') => {
    try {
      const params = {
        page: page - 1, // Spring Data JPA uses 0-based indexing
        size: pageSize,
        query: searchTerm
      };

      const departmentsRes = await axiosInstance.get('/api/department/search', { params });
      setDepartments(departmentsRes.data.content);
      setTotalPages(departmentsRes.data.totalPages);
      setTotalItems(departmentsRes.data.totalElements);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDepartments([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

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
      if (!formData.name || !formData.location) {
        throw new Error('Name and location are required fields');
      }

      // Create department data object
      const departmentData = {
        name: formData.name.trim(),
        location: formData.location.trim()
      };

      console.log('Sending request with:', {
        data: departmentData,
        adminId: adminId
      });

      const response = await axiosInstance.post('/api/department/save', departmentData, {
        params: {
          adminId: adminId
        }
      });

      if (response.data === "Department saved successfully") {
      setShowAddModal(false);
      setFormData({
        name: '',
        location: '',
        employeeCount: 0,
        positionCount: 0
      });
      fetchData(currentPage, searchTerm);
      alert('Department added successfully!');
      } else {
        throw new Error(response.data || 'Failed to add department');
      }
    } catch (error) {
      console.error('Error submitting department:', error);
      console.error('Error details:', { // Debug log
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data || error.message || 'Failed to add department. Please try again.';
      alert(errorMessage);
    }
  };

  const handleEdit = async (department) => {
    try {
      setFormData({
        name: department.name,
        location: department.location
      });
      setShowAddModal(true);
    } catch (error) {
      console.error('Error editing department:', error);
      alert(error.message || 'Failed to edit department');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm('Are you sure you want to delete this department? This action cannot be undone.');
      
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

      await axiosInstance.delete(`/api/department/delete/${id}`, {
        params: { adminId }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting department:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.message.includes('foreign key constraint')) {
        alert('Cannot delete this department because it has active employees or positions. Please reassign or remove them first.');
      } else {
        alert(error.message || 'Failed to delete department');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <FaPlus className="inline-block mr-2" />
          Add Department
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
              placeholder="Search departments..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.department_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {department.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {department.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {department.employees?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(department)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Department"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(department.departmentId)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Department"
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            fetchData(page, searchTerm);
          }}
          pageSize={pageSize}
          totalItems={totalItems}
        />
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Department</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
