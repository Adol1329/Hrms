import { useState } from 'react';
import axios from 'axios';
import { FaCalendarCheck, FaCalendarTimes, FaPlus, FaClock } from 'react-icons/fa';

const UserTimeOff = () => {
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 0,
    sick: 0,
    used: 0,
    remaining: 0
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({
    startDate: '',
    endDate: '',
    type: 'ANNUAL',
    reason: ''
  });
  const [showRequestModal, setShowRequestModal] = useState(false);

  const leaveTypes = [
    { value: 'ANNUAL', label: 'Annual Leave' },
    { value: 'SICK', label: 'Sick Leave' },
    { value: 'PERSONAL', label: 'Personal Leave' }
  ];

  const fetchLeaveData = async () => {
    try {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;
      if (!userId) return;

      const [balanceRes, pendingRes, approvedRes] = await Promise.all([
        axios.get(`/user/leave/balance/${userId}`),
        axios.get(`/user/leave/pending/${userId}`),
        axios.get(`/user/leave/approved/${userId}`)
      ]);

      setLeaveBalance(balanceRes.data);
      setPendingRequests(pendingRes.data);
      setApprovedRequests(approvedRes.data);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleRequest = async () => {
    try {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;
      if (!userId) return;

      await axios.post('/user/leave/request', {
        ...newRequest,
        startDate: new Date(newRequest.startDate).toISOString().split('T')[0],
        endDate: new Date(newRequest.endDate).toISOString().split('T')[0],
        employeeId: userId
      });

      setShowRequestModal(false);
      setNewRequest({
        startDate: '',
        endDate: '',
        type: 'ANNUAL',
        reason: ''
      });
      fetchLeaveData();
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Time Off & Requests</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Leave Balance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Annual Leave</span>
                <span className="text-lg font-bold">{leaveBalance.annual} days</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Used</span>
                <span className="text-sm text-red-600">{leaveBalance.used} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Remaining</span>
                <span className="text-sm text-green-600">{leaveBalance.remaining} days</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Sick Leave</span>
                <span className="text-lg font-bold">{leaveBalance.sick} days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <FaPlus className="inline-block mr-2" />
            Request Time Off
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
        <div className="space-y-4">
          {pendingRequests.map((request, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {request.type === 'ANNUAL' ? 'Annual Leave' :
                     request.type === 'SICK' ? 'Sick Leave' : 'Personal Leave'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(request.startDate).toLocaleDateString()} - 
                    {new Date(request.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending Approval
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Approved Requests</h2>
        <div className="space-y-4">
          {approvedRequests.map((request, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {request.type === 'ANNUAL' ? 'Annual Leave' :
                     request.type === 'SICK' ? 'Sick Leave' : 'Personal Leave'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(request.startDate).toLocaleDateString()} - 
                    {new Date(request.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Approved
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Request Time Off</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleRequest();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                  <select
                    value={newRequest.type}
                    onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="3"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTimeOff;
