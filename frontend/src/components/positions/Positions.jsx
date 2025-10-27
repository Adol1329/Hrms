import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaExclamationCircle } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import Pagination from '../common/Pagination';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    departmentId: '',
    employeeCount: 0
  });
  const [positionLevels, setPositionLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch departments and position levels on component mount
  useEffect(() => {
    fetchDepartments();
    fetchPositionLevels();
  }, []);

  const fetchPositionLevels = async () => {
    try {
      const response = await axiosInstance.get('/api/position/levels');
      if (response.data) {
        setPositionLevels(response.data);
        // Set default level if none selected
        if (!formData.level && response.data.length > 0) {
          setFormData(prev => ({ ...prev, level: response.data[0] }));
        }
      }
    } catch (error) {
      setError('Failed to fetch position levels');
      console.error('Error fetching position levels:', error);
    }
  };

  // Fetch paginated data with search
  const fetchData = async (page = 1, searchTerm = '') => {
    try {
      setError(null);
      const params = {
        page: page - 1,
        size: pageSize,
        query: searchTerm
      };

      // First fetch departments
      console.log('Fetching departments...');
      const departmentsRes = await axiosInstance.get('/api/department/all');
      console.log('Departments response:', departmentsRes);
      
      if (departmentsRes.data && Array.isArray(departmentsRes.data.content)) {
        console.log('Using paginated departments data');
        setDepartments(departmentsRes.data.content);
      } else if (departmentsRes.data && Array.isArray(departmentsRes.data)) {
        console.log('Using direct departments array');
        setDepartments(departmentsRes.data);
      } else {
        console.error('Departments response structure:', departmentsRes.data);
        setError('Failed to load departments. Please try again.');
        setDepartments([]);
      }

      // Then fetch positions
      console.log('Fetching positions...');
      const positionsRes = await axiosInstance.get('/api/position/search', { params });
      console.log('Positions response:', positionsRes);

      if (positionsRes.data && positionsRes.data.content) {
      setPositions(positionsRes.data.content);
      setTotalPages(positionsRes.data.totalPages);
      setTotalItems(positionsRes.data.totalElements);
      setCurrentPage(page);
      } else {
        console.error('Invalid positions response:', positionsRes.data);
        setError('Failed to load positions. Please try again.');
        setPositions([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to load data. Please try again.');
      setDepartments([]);
      setPositions([]);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user?.token) {
        throw new Error('Please log in again.');
      }

      // Create position data
      const positionData = {
        title: formData.title,
        description: formData.description,
        level: formData.level
      };

      console.log('Submitting position data:', positionData);

      const response = await axiosInstance.post(`/api/position/save?departmentId=${formData.departmentId}`, positionData);

      console.log('Position save response:', response);

      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        level: '',
        departmentId: '',
        employeeCount: 0
      });
      fetchData(currentPage, searchTerm);
    } catch (error) {
      console.error('Error submitting position:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save position. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Positions</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <FaPlus className="inline-block mr-2" />
          Add Position
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search positions..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
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
              {positions.map((position) => (
                <tr key={position.position_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {position.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {position.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {position.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {position.department?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {position.employees?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
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
            <h2 className="text-xl font-bold mb-4">Add Position</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Level</option>
                    {positionLevels.map((level) => (
                      <option key={`level-${level}`} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={`dept-${dept.id}`} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
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
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;
