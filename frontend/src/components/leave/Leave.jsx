import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalendar, FaClock } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';

const Leave = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'ANNUAL',
    startDate: '',
    endDate: '',
    status: 'PENDING',
    reason: ''
  });

  const leaveTypes = ['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY'];
  const leaveStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

  // Fetch all required data
  const fetchData = async () => {
    try {
      const [leaveRes, employeesRes] = await Promise.all([
        axiosInstance.get('/api/leave/all'),
        axiosInstance.get('/api/employee/all')
      ]);
      
      setLeaveRequests(leaveRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get admin ID from user context
      const adminId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;
      
      if (!adminId) {
        throw new Error('Admin ID not found');
      }

      const leaveData = {
        type: formData.type,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : null,
        status: formData.status,
        reason: formData.reason
      };

      await axiosInstance.post('/api/leave/save', leaveData, {
        params: {
          employeeId: formData.employeeId,
          adminId: adminId
        }
      });

      setShowAddModal(false);
      setFormData({
        employeeId: '',
        type: 'ANNUAL',
        startDate: '',
        endDate: '',
        status: 'PENDING',
        reason: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  const handleApproval = async (leaveId, status) => {
    try {
      await axiosInstance.patch(`/api/leave/${leaveId}`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <FaPlus className="inline-block mr-2" />
          Add Leave Request
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <FaCalendar className="text-gray-400 mr-2" />
            <span className="text-gray-600">Leave Requests</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
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
              {leaveRequests
                .filter(leave => 
                  leave.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  leave.employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  leave.type.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((leave) => (
                  <tr key={leave.leave_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {leave.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(leave.startDate).toLocaleDateString()} - 
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        leave.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {leave.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproval(leave.leave_id, 'APPROVED')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleApproval(leave.leave_id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
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
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Leave Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.emp_id} value={emp.emp_id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
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
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    min={formData.startDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="3"
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
                  Save Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
