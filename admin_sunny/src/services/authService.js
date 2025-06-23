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
        if (username === 'admin' && password === 'password') {
          const mockUser = {
            username: 'admin',
            role: 'admin',
            token: 'mock-jwt-token'
          };
          
          // Store auth data in localStorage
          localStorage.setItem(TOKEN_KEY, mockUser.token);
          localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
          
          return mockUser;
        } else {
          throw new Error('Invalid credentials');
        }
      }
      
      // Real API call
      const response = await api.post('/auth/login', { username, password });
      const userData = response.data;
      
      localStorage.setItem(TOKEN_KEY, userData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      if (config.USE_MOCK_DATA) {
        console.log('Using mock auth data');
        
        // Remove auth data from localStorage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        
        return true;
      }
      
      // Real API call
      await api.post('/auth/logout');
      
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
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;