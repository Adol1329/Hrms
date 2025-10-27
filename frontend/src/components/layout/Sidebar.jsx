import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaHome, FaUsers, FaBuilding, FaFileContract, FaMoneyBill, FaSignOutAlt, FaBars, FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FaUsers, label: 'Employees', path: '/admin/employees' },
    { icon: FaBuilding, label: 'Departments', path: '/admin/departments' },
    { icon: FaBriefcase, label: 'Positions', path: '/admin/positions' },
    { icon: FaFileContract, label: 'Contracts', path: '/admin/contracts' },
    { icon: FaMoneyBill, label: 'Salary', path: '/admin/salary' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || user.role !== 'Admin') {
    return null;
  }

  return (
    <div 
      className={`bg-gradient-to-b from-indigo-800 to-indigo-900 text-white h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg">
        <FaUser className="text-2xl" />
            </div>
            {!isCollapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
      </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FaBars />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className={`text-xl ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
      </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
        >
            <FaSignOutAlt className={`text-xl ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && <span>Logout</span>}
        </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
