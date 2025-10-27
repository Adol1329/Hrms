import { FaUsers, FaClock, FaShieldAlt, FaChartBar } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">About Our HRMS</h1>
          <p className="text-xl">
            Empowering organizations with comprehensive HR management solutions
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
            <p className="text-gray-600 text-lg mb-8">
              To provide organizations with a powerful, user-friendly HR management system
              that streamlines operations, enhances employee engagement, and drives
              organizational success through efficient human resource management.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our HRMS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard
              icon={<FaUsers />}
              title="User-Friendly"
              description="Intuitive interface designed for easy navigation and efficient management"
            />
            <BenefitCard
              icon={<FaClock />}
              title="Time-Saving"
              description="Automated processes that reduce manual work and increase productivity"
            />
            <BenefitCard
              icon={<FaShieldAlt />}
              title="Secure"
              description="Advanced security measures to protect sensitive employee data"
            />
            <BenefitCard
              icon={<FaChartBar />}
              title="Insightful"
              description="Comprehensive reporting and analytics for informed decision-making"
            />
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Our Technology Stack</h2>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Frontend</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• React.js for dynamic UI</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• React Router for navigation</li>
                  <li>• Context API for state management</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Backend</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Spring Boot framework</li>
                  <li>• PostgreSQL database</li>
                  <li>• RESTful API architecture</li>
                  <li>• JWT authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BenefitCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="text-3xl text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default About; 