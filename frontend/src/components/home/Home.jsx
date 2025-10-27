import { Link } from 'react-router-dom';
import { FaUsers, FaBuilding, FaBriefcase, FaChartLine } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              Human Resources Management System
            </h1>
            <p className="text-xl mb-8">
              Streamline your HR operations with our comprehensive management solution
            </p>
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-300"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<FaUsers className="text-4xl text-blue-600" />}
              title="Employee Management"
              description="Efficiently manage employee data, onboarding, and documentation"
            />
            <FeatureCard
              icon={<FaBuilding className="text-4xl text-blue-600" />}
              title="Department Organization"
              description="Organize and track departments, roles, and responsibilities"
            />
            <FeatureCard
              icon={<FaBriefcase className="text-4xl text-blue-600" />}
              title="Leave Management"
              description="Streamline leave requests, approvals, and tracking"
            />
            <FeatureCard
              icon={<FaChartLine className="text-4xl text-blue-600" />}
              title="Performance Tracking"
              description="Monitor and evaluate employee performance and growth"
            />
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your HR Management?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of companies that trust our HRMS for their HR operations
          </p>
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Home; 