import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ERole, getRoleEnumValue } from '../../utils/roles';
import { FaEnvelope, FaLock, FaUserPlus, FaKey, FaCheckCircle } from 'react-icons/fa';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: ERole.User,
    adminKey: '',
    verificationCode: ''
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? value : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      try {
        if (!formData.email || !formData.email.includes('@')) {
          setError('Please enter a valid email address');
          return;
        }

        if (formData.password.length < 6 || formData.password.length > 40) {
          setError('Password must be between 6 and 40 characters');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        if (formData.role === ERole.Admin && !formData.adminKey.toLowerCase().includes('admin12345')) {
          setError('Invalid admin key');
          return;
        }

        const response = await axios.post('http://localhost:8080/api/auth/signup', {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          adminKey: formData.role === ERole.Admin ? formData.adminKey : ''
        });
        
        setFormData(prev => ({
          ...prev,
          verificationCode: ''
        }));
        setStep(2);
        setError('');
      } catch (err) {
        console.error('Signup error:', err.response?.data);
        setError(err.response?.data?.message || 'Signup failed. Please try again.');
      }
    } else if (step === 2) {
      try {
        await axios.post(`http://localhost:8080/api/auth/verify-email?email=${encodeURIComponent(formData.email)}&code=${encodeURIComponent(formData.verificationCode)}`);
        navigate('/login');
      } catch (err) {
        console.error('Verification error:', err.response?.data);
        setError(err.response?.data?.message || 'Verification failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Icon Section */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl mb-4">
            {step === 1 ? (
              <FaUserPlus className="h-12 w-12 text-white" />
            ) : (
              <FaCheckCircle className="h-12 w-12 text-white" />
            )}
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 drop-shadow-sm">
            {step === 1 ? 'Create Your Account' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 ? 'Join us today and get started' : 'Please check your email for the verification code'}
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
              <div className="rounded-md bg-red-50 p-4 animate-shake">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-red-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
              <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
            </div>
          )}
          
            {step === 1 ? (
              <div className="space-y-4">
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                <input
                      id="email"
                  type="email"
                  name="email"
                  required
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                      placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
                </div>

              <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                <input
                      id="password"
                  type="password"
                  name="password"
                  required
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                      placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
                </div>

              <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                <input
                      id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  required
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                      placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Account Type</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="User"
                    checked={formData.role === ERole.User}
                    onChange={handleChange}
                        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                      <span className="ml-2 text-sm text-gray-700">User</span>
                </label>
                    <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="Admin"
                    checked={formData.role === ERole.Admin}
                    onChange={handleChange}
                        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                      <span className="ml-2 text-sm text-gray-700">Admin</span>
                </label>
              </div>
                </div>

              {formData.role === ERole.Admin && (
                  <div>
                    <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700">
                      Admin Key
                  </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="h-5 w-5 text-gray-400" />
                      </div>
                  <input
                        id="adminKey"
                    type="password"
                        name="adminKey"
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                        placeholder="Enter admin key"
                    value={formData.adminKey}
                        onChange={handleChange}
                  />
                    </div>
                </div>
              )}
              </div>
            ) : (
            <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="h-5 w-5 text-gray-400" />
                  </div>
              <input
                    id="verificationCode"
                type="text"
                name="verificationCode"
                required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                placeholder="Enter verification code"
                value={formData.verificationCode}
                onChange={handleChange}
              />
                </div>
            </div>
          )}

          <div>
            <button
              type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-0.5"
            >
                {step === 1 ? 'Create Account' : 'Verify Email'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-indigo-500 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                  Sign in instead
            </button>
              </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
