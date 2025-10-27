import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track if we're refreshing the token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    // Add 30 seconds buffer to prevent edge cases
    return (decoded.exp * 1000) < (Date.now() - 30000);
  } catch (e) {
    console.error('Error checking token expiry:', e);
    return true;
  }
};

// Retry failed requests
const retryRequest = async (error, maxRetries = 3) => {
  if (error.config && (!error.config.__retryCount || error.config.__retryCount < maxRetries)) {
    error.config.__retryCount = error.config.__retryCount || 0;
    error.config.__retryCount += 1;
    return await axiosInstance(error.config);
  }
  return Promise.reject(error);
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (user?.refreshToken) {
          const response = await axios.post('http://localhost:8080/api/auth/refresh-token', {
            refreshToken: user.refreshToken
          });

          if (response.data?.token) {
            // Update token in localStorage
            localStorage.setItem('user', JSON.stringify({
              ...user,
              token: response.data.token
            }));

            // Update the failed request's authorization header
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login if refresh token is invalid
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Log API errors for debugging
    if (error.response) {
      console.error('API Error:', {
        url: error.config.url,
        method: error.config.method,
        status: error.response.status,
        data: error.response.data,
        headers: error.config.headers // Log headers to debug authorization
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 