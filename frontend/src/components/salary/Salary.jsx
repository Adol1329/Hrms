import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import Pagination from '../common/Pagination';

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    baseSalary: 0,
    deductions: 0,
    bonus: 0
  });

  // Fetch all required data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [salariesRes, employeesRes] = await Promise.all([
        axiosInstance.get('/api/salary/all', {
          params: {
            page: currentPage - 1,
            size: pageSize,
            paginated: true
          }
        }),
        axiosInstance.get('/api/employee/all', {
          params: {
            page: 0,
            size: 1000 // Get all employees for the dropdown
          }
        })
      ]);
      
      setSalaries(salariesRes.data.content || []);
      setTotalPages(salariesRes.data.totalPages || 1);
      setTotalItems(salariesRes.data.totalElements || 0);
      
      // Handle paginated employee response
      const employeeData = employeesRes.data?.content || [];
      if (!Array.isArray(employeeData)) {
        console.error('Invalid employee data format:', employeesRes.data);
        setError('Failed to load employee data. Invalid format received.');
        setEmployees([]);
        return;
      }
      
      // Debug log
      console.log('Employee data structure:', {
        firstEmployee: employeeData[0],
        employeeCount: employeeData.length,
        employeeIds: employeeData.map(emp => emp.empId)
      });
      
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load salary data. Please try again later.');
      setSalaries([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddSalary = () => {
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.employeeId) {
        throw new Error('Please select an employee');
      }

      // Validate that employeeId is a valid UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(formData.employeeId)) {
        console.error('Invalid employee ID format:', formData.employeeId);
        throw new Error('Invalid employee ID format. Please select an employee from the dropdown.');
      }

      if (!formData.baseSalary || formData.baseSalary <= 0) {
        throw new Error('Base salary must be greater than 0');
      }

      // Get user data from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found. Please login again.');
      }

      const user = JSON.parse(userStr);
      if (!user.token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Decode JWT token to get user email
      const tokenPayload = JSON.parse(atob(user.token.split('.')[1]));
      
      // Get user details from backend using email
      const userResponse = await axiosInstance.get(`/api/user/email/${encodeURIComponent(tokenPayload.sub)}`);
      
      if (!userResponse.data?.userId) {
        throw new Error('Failed to get user details. Please login again.');
      }

      const adminId = userResponse.data.userId;

      const salaryData = {
        baseSalary: parseFloat(formData.baseSalary),
        deductions: parseFloat(formData.deductions || 0),
        bonus: parseFloat(formData.bonus || 0)
      };

      // Debug log
      console.log('Submitting salary with:', {
        employeeId: formData.employeeId,
        adminId: adminId,
        salaryData
      });

      const response = await axiosInstance.post('/api/salary/save', salaryData, {
        params: {
          employeeId: formData.employeeId,
          adminId: adminId
        }
      });

      if (response.data === "Salary saved successfully") {
        setShowAddModal(false);
        setFormData({
          employeeId: '',
          baseSalary: 0,
          deductions: 0,
          bonus: 0
        });
        fetchData();
      } else {
        throw new Error(response.data || 'Failed to add salary');
      }
    } catch (error) {
      console.error('Error adding salary:', error);
      alert(error.message || 'Failed to add salary');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Get admin ID from user context
      const adminId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;
      
      if (!adminId) {
        throw new Error('Admin ID not found');
      }

      const salaryData = {
        baseSalary: parseFloat(formData.baseSalary),
        deductions: parseFloat(formData.deductions),
        bonus: parseFloat(formData.bonus)
      };

      await axiosInstance.put(`/api/salary/update/${selectedSalary.salary_id}`, salaryData, {
        params: {
          adminId: adminId
        }
      });

      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error updating salary:', error);
      alert(error.message || 'Failed to update salary');
    }
  };

  const handleBulkAdjust = async (e) => {
    e.preventDefault();
    try {
      // Get admin ID from user context
      const adminId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;
      
      if (!adminId) {
        throw new Error('Admin ID not found');
      }

      const selectedEmployeeIds = document.querySelectorAll('input[name="select-salary"]:checked')
        .map(checkbox => checkbox.value);

      if (selectedEmployeeIds.length === 0) {
        throw new Error('No salaries selected');
      }

      await axiosInstance.put('/api/salary/bulk-adjust', null, {
        params: {
          employeeIds: selectedEmployeeIds,
          baseAdjustment: parseFloat(formData.baseSalary),
          adminId: adminId
        }
      });

      fetchData();
    } catch (error) {
      console.error('Error bulk adjusting salaries:', error);
      alert(error.message || 'Failed to bulk adjust salaries');
    }
  };

  const handleEdit = async (salary) => {
    try {
      setSelectedSalary(salary);
      setFormData({
        employeeId: salary.employee?.empId,
        baseSalary: salary.baseSalary,
        deductions: salary.deductions,
        bonus: salary.bonus
      });
      setShowAddModal(true);
    } catch (error) {
      console.error('Error editing salary:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm('Are you sure you want to delete this salary record? This action cannot be undone.');
      
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

      await axiosInstance.delete(`/api/salary/delete/${id}`, {
        params: { adminId }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting salary:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert(error.message || 'Failed to delete salary record');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Salary Administration</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search salaries..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-64 px-3 py-2 border rounded-lg"
            />
            <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
          </div>
          <button
            onClick={handleAddSalary}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <FaPlus className="inline-block mr-2" />
            Add Salary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Employees</h3>
          <p className="text-3xl font-bold text-indigo-600">{employees?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Salary Expense</h3>
          <p className="text-3xl font-bold text-green-600">
            ${(salaries || []).reduce((sum, salary) => sum + (parseFloat(salary.baseSalary) || 0) - (parseFloat(salary.deductions) || 0) + (parseFloat(salary.bonus) || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Average Salary</h3>
          <p className="text-3xl font-bold text-yellow-600">
            ${salaries?.length > 0 ? ((salaries || []).reduce((sum, salary) => sum + (parseFloat(salary.baseSalary) || 0) - (parseFloat(salary.deductions) || 0) + (parseFloat(salary.bonus) || 0), 0) / salaries.length).toLocaleString() : 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Salary Adjustments</h3>
          <p className="text-3xl font-bold text-blue-600">{(salaries || []).filter(salary => salary.effectiveDate > new Date().toISOString().split('T')[0]).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">Loading salary data...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">{error}</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effective Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(salaries || [])
                  .filter(salary => 
                    salary.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    salary.employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((salary) => (
                    <tr key={salary.salary_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {salary.employee?.firstName} {salary.employee?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${(salary.baseSalary || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${(salary.deductions || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${(salary.bonus || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${((salary.baseSalary || 0) - (salary.deductions || 0) + (salary.bonus || 0)).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {salary.effectiveDate ? new Date(salary.effectiveDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(salary)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(salary.salary_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                disabled={loading}
              />
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{selectedSalary ? 'Edit Salary' : 'Add Salary'}</h2>
            <form onSubmit={selectedSalary ? handleUpdate : handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      console.log('Selected employee ID:', selectedId);
                      setFormData({ ...formData, employeeId: selectedId });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    disabled={selectedSalary}
                  >
                    <option key="default" value="">Select Employee</option>
                    {Array.isArray(employees) && employees.map((emp) => (
                      <option key={emp.empId} value={emp.empId}>
                        {`${emp.firstName} ${emp.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Base Salary</label>
                  <input
                    type="number"
                    name="baseSalary"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deductions</label>
                  <input
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bonus</label>
                  <input
                    type="number"
                    name="bonus"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedSalary(null);
                    setFormData({
                      employeeId: '',
                      baseSalary: 0,
                      deductions: 0,
                      bonus: 0
                    });
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {selectedSalary ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
