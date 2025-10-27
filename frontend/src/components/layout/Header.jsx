import { useState } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import GlobalSearch from '../search/GlobalSearch';

const Header = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  if (!user) return null;

  return (
    <div className="bg-white shadow-md h-16 flex items-center justify-between px-6">
      <h1 className="text-xl font-bold">
        {user.role === 'Admin' ? 'Welcome Admin 😎' : 'Welcome Employee😎'}
      </h1>
      
      {user.role === 'Admin' && <GlobalSearch />}
      
      <div className="flex items-center space-x-4">
        <button
          onClick={handleNotificationClick}
          className="relative p-2 hover:bg-gray-100 rounded-full"
        >
          <FaBell className="text-xl" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
        
        <div className="flex items-center space-x-2">
          <FaUserCircle className="text-2xl" />
          <span className="font-medium">{user.email}</span>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-2">
          <h3 className="text-sm font-medium px-3 pb-2 border-b">Notifications</h3>
          <div className="max-h-48 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="p-3 border-b hover:bg-gray-50 cursor-pointer"
              >
                {notification.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
