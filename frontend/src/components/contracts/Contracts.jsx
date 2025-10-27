import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import Pagination from '../common/Pagination';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'FullTime',
    startDate: '',
    endDate: '',
    description: '',
    status: 'Active'
  });
  const [error, setError] = useState(null);

  const contractTypes = ['FullTime', 'PartTime', 'Internship', 'Temporary'];
  const contractStatuses = ['Active', 'Expired', 'Terminated'];

  // Fetch paginated data with search
  const fetchData = async (page = 1, searchTerm = '') => {
    try {
      const params = {
        page: page - 1,
        size: pageSize,
        query: searchTerm || ''
      };

      const [contractsRes, employeesRes] = await Promise.all([
        axiosInstance.get('/api/search/contracts', { params }),
        axiosInstance.get('/api/employee/all', {
          params: {
            page: 0,
            size: 100
          }
        })
      ]);

      console.log('Contract Response:', contractsRes.data); // Add this for debugging

      // Transform contract data to ensure proper structure
      const transformedContracts = (contractsRes.data.content || []).map(contract => ({
        contractId: contract.contractId || contract.contract_id,
        employee: {
          firstName: contract.employee?.firstName || '',
          lastName: contract.employee?.lastName || ''
        },
        contractType: contract.contractType || 'N/A',
        contractStartDate: contract.contractStartDate || null,
        contractEndDate: contract.contractEndDate || null,
        status: contract.status || 'N/A'
      }));

      console.log('Transformed Contracts:', transformedContracts); // Add this for debugging

      setContracts(transformedContracts);
      setTotalPages(contractsRes.data.totalPages || 1);
      setTotalItems(contractsRes.data.totalElements || 0);
      setCurrentPage(page);
      setEmployees(employeesRes.data.content || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to fetch data');
      setContracts([]);
      setEmployees([]);
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
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Use email instead of userId since that's what we have in the stored user object
      if (!user.email) {
        throw new Error('User email not found. Please log in again.');
      }

      const contractData = {
        contractType: formData.type,
        contractStartDate: formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : null,
        contractEndDate: formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : null,
        description: formData.description,
        status: formData.status
      };

      // Send the contract data with email instead of adminId
      await axiosInstance.post('/api/contract/save', contractData, {
        params: {
          employeeId: formData.employeeId,
          adminEmail: user.email
        },
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      setShowAddModal(false);
      setFormData({
        employeeId: '',
        type: 'FullTime',
        startDate: '',
        endDate: '',
        description: '',
        status: 'Active'
      });
      fetchData(currentPage, searchTerm);
    } catch (error) {
      console.error('Error adding contract:', error);
      setError(error.response?.data?.message || error.message || 'Failed to add contract');
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      // Get admin ID from user context
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.user_id) {
        throw new Error('Admin ID not found');
      }

      await axiosInstance.put(`/api/contract/update-status/${selectedContract.contract_id}`, null, {
        params: {
          status: formData.status,
          adminId: user.user_id
        }
      });

      setShowStatusModal(false);
      fetchData();
    } catch (error) {
      console.error('Error updating contract status:', error);
      alert(error.message || 'Failed to update contract status');
    }
  };

  const handleRenew = async (id) => {
    try {
      await axiosInstance.put(`/api/contract/renew/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error renewing contract:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm('Are you sure you want to delete this contract? This action cannot be undone.');
      
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

      await axiosInstance.delete(`/api/contract/delete/${id}`, {
        params: { adminId }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting contract:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.message.includes('foreign key constraint')) {
        alert('Cannot delete this contract because it has related records. Please remove those first.');
      } else {
        alert(error.message || 'Failed to delete contract');
      }
    }
  };

  const handleEdit = async (contract) => {
    try {
      setSelectedContract(contract);
      setShowStatusModal(true);
    } catch (error) {
      console.error('Error editing contract:', error);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddContract = () => {
    setShowAddModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
              className="w-64 px-3 py-2 border rounded-lg"
            />
            <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
          </div>
          <button
            onClick={handleAddContract}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <FaPlus className="inline-block mr-2" />
            Add Contract
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract.contractId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.employee?.firstName || contract.employee?.lastName 
                      ? `${contract.employee.firstName || ''} ${contract.employee.lastName || ''}`.trim() 
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {contract.contractType?.toLowerCase().replace(/_/g, ' ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.contractStartDate 
                      ? new Date(contract.contractStartDate).toLocaleDateString() 
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.contractEndDate 
                      ? new Date(contract.contractEndDate).toLocaleDateString() 
                      : 'Ongoing'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      contract.status === 'EXPIRED' ? 'bg-yellow-100 text-yellow-800' :
                      contract.status === 'TERMINATED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(contract)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Contract"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(contract.contractId)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Contract"
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
            <h2 className="text-xl font-bold mb-4">Add Contract</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select employee</option>
                    {Array.isArray(employees) && employees.length > 0 ? (
                      employees.map((employee) => (
                        <option key={employee.empId} value={employee.empId}>
                        {employee.firstName} {employee.lastName} - {employee.email}
                      </option>
                      ))
                    ) : (
                      <option value="" disabled>No employees available</option>
                    )}
                  </select>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  >
                    {contractTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    min={formData.startDate ? formData.startDate : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  >
                    {contractStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    rows="3"
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Change Status</h2>
            <form onSubmit={handleStatusChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  >
                    {contractStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
