import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import Employees from './components/employees/Employees';
import Contracts from './components/contracts/Contracts';
import Salary from './components/salary/Salary';
import Departments from './components/departments/Departments';
import Positions from './components/positions/Positions';
import Leave from './components/leave/Leave';
import Sidebar from './components/layout/Sidebar';
import UserSidebar from './components/layout/UserSidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import UserDashboard from './components/user/UserDashboard';
import UserProfile from './components/user/UserProfile';
import UserEmployment from './components/user/UserEmployment';
import UserSalary from './components/user/UserSalary';
import Home from './components/home/Home';
import About from './components/about/About';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AppRoutes() {
  const { user } = useAuth();

  const ProtectedRoute = ({ children, allowedRole }) => {
    console.log('ProtectedRoute - Current user:', user);
    console.log('ProtectedRoute - Required role:', allowedRole);
    
    if (!user) {
      console.log('ProtectedRoute - No user found, redirecting to login');
      return <Navigate to="/login" />;
    }
    
    if (allowedRole && user.role !== allowedRole) {
      console.log(`ProtectedRoute - User role ${user.role} does not match required role ${allowedRole}`);
      return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/user/dashboard'} />;
    }
    
    console.log('ProtectedRoute - Access granted');
    return children;
  };

  const PublicLayout = ({ children }) => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );

  const AdminLayout = () => (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="departments" element={<Departments />} />
            <Route path="positions" element={<Positions />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="salary" element={<Salary />} />
            <Route path="leave" element={<Leave />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );

  const UserLayout = () => (
    <div className="flex h-screen">
      <UserSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index element={<UserDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="employment" element={<UserEmployment />} />
            <Route path="salary" element={<UserSalary />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />
      <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRole="Admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute allowedRole="User">
            <UserLayout />
          </ProtectedRoute>
        }
      />
      
      {/* Default Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
