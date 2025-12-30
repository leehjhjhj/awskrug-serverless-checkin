import api from './api';
import config from '../config';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

const authService = {
  // Login user
  login: async (username, password) => {
    try {
      if (config.USE_MOCK_DATA) {
        console.log('Using mock auth data');

        // Simple mock authentication
        if (username === 'admin' && password === 'admin123!') {
          const mockUser = {
            access_token: 'mock-jwt-token',
            token_type: 'bearer',
            user_id: 'mock-user-id-1234',
            username: 'admin',
            role: 'super_admin',
            organizations: []
          };

          // Store auth data in localStorage
          localStorage.setItem(TOKEN_KEY, mockUser.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

          return mockUser;
        } else {
          throw new Error('Invalid credentials');
        }
      }

      // Real API call
      const response = await api.post('/auth/login', { username, password });
      const userData = response.data;

      // Store token and user data
      localStorage.setItem(TOKEN_KEY, userData.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      return userData;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      // Simply remove auth data from localStorage
      // No API call needed (stateless JWT)
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      return true;
    } catch (error) {
      throw new Error('Logout failed');
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      // No token or user data
      if (!token || !userStr) {
        return null;
      }

      const user = JSON.parse(userStr);

      // Validate user data structure (must have access_token)
      if (!user.access_token && !user.token) {
        // Invalid user data - clear localStorage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }

      return user;
    } catch (error) {
      // Invalid data - clear localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;