import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { FaUsers, FaFileContract, FaBuilding, FaUserPlus, FaSpinner, FaExclamationCircle, FaCalendarAlt } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeContracts: 0,
    departments: 0,
    recentHires: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/dashboard/admin/summary');
        setStats(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401) {
          setError('You are not authorized to view this dashboard. Please log in with an admin account.');
        } else {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-600" />
          <span className="ml-3 text-lg text-gray-600">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-400 text-xl" />
            <div className="ml-3">
              <h3 className="text-red-800 font-medium">Error</h3>
              <div className="text-red-700 mt-1">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FaCalendarAlt />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalEmployees}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <FaUsers className="text-2xl text-indigo-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-gray-500">Active workforce</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Contracts</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeContracts}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FaFileContract className="text-2xl text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-gray-500">Current agreements</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Departments</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.totalDepartments}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FaBuilding className="text-2xl text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-gray-500">Company divisions</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Recent Hires</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.recentHires?.length || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUserPlus className="text-2xl text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-gray-500">New team members</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaUserPlus className="mr-2 text-indigo-600" />
                Recent Hires
              </h2>
              <div className="space-y-4">
                {stats.recentHires && stats.recentHires.length > 0 ? (
                  stats.recentHires.map((hire, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div>
                        <h3 className="font-medium text-gray-900">{hire.name}</h3>
                        <p className="text-sm text-gray-500">{hire.position}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                        {hire.date}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No recent hires</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaFileContract className="mr-2 text-yellow-600" />
                Upcoming Contract Expirations
              </h2>
              <div className="space-y-4">
                {stats.upcomingExpirations && stats.upcomingExpirations.length > 0 ? (
                  stats.upcomingExpirations.map((contract, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div>
                        <h3 className="font-medium text-gray-900">{contract.employeeName}</h3>
                        <p className="text-sm text-gray-500">{contract.position}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                        contract.daysUntilExpiration <= 7
                          ? 'bg-red-100 text-red-800'
                          : contract.daysUntilExpiration <= 14
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {contract.daysUntilExpiration} days
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No upcoming contract expirations</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
