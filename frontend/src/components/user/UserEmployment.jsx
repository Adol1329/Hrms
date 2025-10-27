import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { FaBuilding, FaUsers, FaCalendar, FaUserTie } from 'react-icons/fa';

const UserEmployment = () => {
  const [employmentData, setEmploymentData] = useState({
    employeeInfo: null,
    currentContract: null,
    departmentInfo: null,
    departmentColleagues: []
  });

  useEffect(() => {
    const fetchEmploymentData = async () => {
      try {
        const response = await axiosInstance.get('/api/dashboard/user/summary');
        setEmploymentData(response.data);
      } catch (error) {
        console.error('Error fetching employment data:', error);
      }
    };

    fetchEmploymentData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Employment Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Position</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaBuilding className="text-xl text-gray-400" />
              <span className="text-gray-500">Department:</span>
              <span className="font-medium">{employmentData.employeeInfo?.department?.name || 'Not assigned'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaUserTie className="text-xl text-gray-400" />
              <span className="text-gray-500">Position:</span>
              <span className="font-medium">{employmentData.employeeInfo?.position?.title || 'Not assigned'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCalendar className="text-xl text-gray-400" />
              <span className="text-gray-500">Start Date:</span>
              <span className="font-medium">
                {employmentData.currentContract?.contractStartDate ? 
                  new Date(employmentData.currentContract.contractStartDate).toLocaleDateString() : 
                  'Not specified'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Contract Type:</span>
              <span className="font-medium">
                {employmentData.currentContract?.contractType || 'Not specified'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Status:</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                employmentData.currentContract?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                employmentData.currentContract?.status === 'PROBATION' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {employmentData.currentContract?.status || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Department Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaBuilding className="text-xl text-gray-400" />
              <span className="text-gray-500">Name:</span>
              <span className="font-medium">{employmentData.departmentInfo?.name || 'Not assigned'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Location:</span>
              <span className="font-medium">{employmentData.departmentInfo?.location || 'Not specified'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaUsers className="text-xl text-gray-400" />
              <span className="text-gray-500">Team Size:</span>
              <span className="font-medium">{employmentData.departmentColleagues?.length || 0} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Colleagues Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Department Colleagues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employmentData.departmentColleagues && employmentData.departmentColleagues.length > 0 ? (
            employmentData.departmentColleagues.map((colleague, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{colleague.firstName} {colleague.lastName}</p>
                <p className="text-sm text-gray-500">{colleague.position?.title || 'No position'}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No department colleagues found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEmployment;
