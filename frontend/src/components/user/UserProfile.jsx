import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    department: null,
    position: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        const userData = JSON.parse(userStr);
        if (!userData.id) {
          const userResponse = await axiosInstance.get(`/api/user/email/${encodeURIComponent(userData.email)}`);
          if (!userResponse.data?.userId) {
            throw new Error('Failed to get user details');
          }
          userData.id = userResponse.data.userId;
        }

        const response = await axiosInstance.get(`/api/user/profile/${userData.id}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Personal Profile</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <input
                  type="text"
                  value={profile.firstName || ''}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName || ''}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth || ''}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <input
                  type="text"
                  value={profile.gender || ''}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Contact & Employment Information</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <input
                  type="email"
                  value={profile.email || ''}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">Department</label>
                <input
                  type="text"
                  value={profile.department?.name || 'Not assigned'}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500">Position</label>
                <input
                  type="text"
                  value={profile.position?.title || 'Not assigned'}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
