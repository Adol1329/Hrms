import React, { useState, useEffect } from 'react';
import { FaUser, FaBriefcase, FaCalendarAlt, FaMoneyBill, FaClock, FaFileAlt, FaChartLine, FaExclamationTriangle, FaBuilding } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    profile: null,
    contract: null,
    salary: null,
    timeOff: null,
    recentActivities: [],
    linkedToEmployee: true,
    message: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/api/dashboard/user/summary');
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          ...userData,
          linkedToEmployee: false,
          message: 'Your account is not linked to an employee record. Please contact HR if you believe this is an error.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
  return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {user?.email?.split('@')[0] || 'User'}!</h1>
            <p className="mt-1 text-gray-500">Here's what's happening with your employment</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FaCalendarAlt />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {!userData.linkedToEmployee ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {userData.message || "Your account is not linked to an employee record. Please contact HR if you believe this is an error."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Profile Overview Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Profile</p>
                      <p className="text-lg font-semibold text-gray-900">{userData.employeeInfo?.firstName} {userData.employeeInfo?.lastName}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FaUser className="text-2xl text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Department: {userData.employeeInfo?.department?.name || 'Not assigned'}</p>
                    <p className="text-sm text-gray-500">Position: {userData.employeeInfo?.position?.title || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Employment Details Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Contract</p>
                      <p className="text-lg font-semibold text-gray-900">Employment Status</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaBriefcase className="text-2xl text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Type: {userData.currentContract?.contractType || 'Not specified'}</p>
                    <p className="text-sm text-gray-500">Status: {userData.currentContract?.status || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Salary Information Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Salary</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {userData.salaryHistory && userData.salaryHistory.length > 0
                          ? `$${userData.salaryHistory[0].totalSalary.toLocaleString()}`
                          : 'Not available'}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaMoneyBill className="text-2xl text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Base: {userData.salaryHistory && userData.salaryHistory.length > 0 ? `$${userData.salaryHistory[0].baseSalary.toLocaleString()}` : 'N/A'}</p>
                    <p className="text-sm text-gray-500">Bonus: {userData.salaryHistory && userData.salaryHistory.length > 0 ? `$${userData.salaryHistory[0].bonus.toLocaleString()}` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Department Info Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Department</p>
                      <p className="text-lg font-semibold text-gray-900">{userData.departmentInfo?.name || 'Not assigned'}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <FaBuilding className="text-2xl text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Location: {userData.departmentInfo?.location || 'Not specified'}</p>
                    <p className="text-sm text-gray-500">Team Size: {userData.departmentColleagues?.length || 0} members</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional sections for department colleagues, etc. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Department Colleagues</h2>
                  <div className="space-y-4">
                    {userData.departmentColleagues && userData.departmentColleagues.length > 0 ? (
                      userData.departmentColleagues.map((colleague, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{colleague.firstName} {colleague.lastName}</p>
                            <p className="text-sm text-gray-500">{colleague.position?.title || 'No position'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">No department colleagues found</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Employment History</h2>
                  <div className="space-y-4">
                    {userData.currentContract ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">Current Contract</p>
                        <p className="text-sm text-gray-500">Type: {userData.currentContract.contractType}</p>
                        <p className="text-sm text-gray-500">Start Date: {new Date(userData.currentContract.contractStartDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">End Date: {userData.currentContract.contractEndDate ? new Date(userData.currentContract.contractEndDate).toLocaleDateString() : 'Ongoing'}</p>
                        <p className="text-sm text-gray-500">Status: {userData.currentContract.status}</p>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">No contract information available</p>
                    )}
                  </div>
                </div>
              </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
