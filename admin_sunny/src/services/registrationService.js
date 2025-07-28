import api from './api';
import config from '../config';
import { mockRegistrations } from './mockData';

const registrationService = {
  // Get all registrations for an event
  getRegistrations: async (eventCode) => {
    console.log('Fetching registrations for event:', eventCode);
    
    try {
      const response = await api.get('/registration/list', { params: { event_code: eventCode } });
      console.log('Registration list API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration list API error:', error);
      // Fallback to mock data if API fails
      if (config.USE_MOCK_DATA) {
        console.log('Falling back to mock registration data');
        const registrations = mockRegistrations[eventCode] || [];
        return registrations;
      }
      throw error;
    }
  },


  // Add a single registration to an event
  addRegistration: async (eventCode, registrationData) => {
    console.log('Adding registration for event:', eventCode, registrationData);
    
    try {
      const payload = {
        partition_key: eventCode,
        sort_key: registrationData.phone,
        name: registrationData.name,
        email: registrationData.email
      };
      
      const response = await api.post('/registration', payload);
      console.log('Add registration API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add registration API error:', error);
      // Fallback to mock data if API fails
      if (config.USE_MOCK_DATA) {
        console.log('Falling back to mock registration data');
        const hash = 'hash' + Math.floor(Math.random() * 1000);
        const newRegistration = {
          ...registrationData,
          phone: hash
        };
        
        if (!mockRegistrations[eventCode]) {
          mockRegistrations[eventCode] = [];
        }
        
        mockRegistrations[eventCode].push(newRegistration);
        return { ...newRegistration, event_code: eventCode };
      }
      throw error;
    }
  },

  // Delete a registration
  deleteRegistration: async (eventCode, phone) => {
    console.log('Deleting registration for event:', eventCode, 'phone:', phone);
    
    try {
      const payload = {
        event_code: eventCode,
        phone: phone
      };
      
      const response = await api.delete('/registration', { data: payload });
      console.log('Delete registration API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete registration API error:', error);
      // Fallback to mock data if API fails
      if (config.USE_MOCK_DATA) {
        console.log('Falling back to mock registration data');
        if (!mockRegistrations[eventCode]) {
          throw new Error('Event not found');
        }
        
        const index = mockRegistrations[eventCode].findIndex(r => r.phone === phone);
        if (index === -1) {
          throw new Error('Registration not found');
        }
        
        mockRegistrations[eventCode].splice(index, 1);
        return { message: '등록이 성공적으로 삭제되었습니다' };
      }
      throw error;
    }
  },

  // Upload registrations via Excel file
  uploadRegistrations: async (eventCode, file) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock registration data');
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add some mock registrations
      if (!mockRegistrations[eventCode]) {
        mockRegistrations[eventCode] = [];
      }
      
      const mockCount = Math.floor(Math.random() * 5) + 1; // 1-5 registrations
      for (let i = 0; i < mockCount; i++) {
        const hash = 'hash' + Math.floor(Math.random() * 1000);
        mockRegistrations[eventCode].push({
          phone: hash,
          name: `업로드사용자${i+1}`,
          email: `upload${i+1}@example.com`
        });
      }
      
      return {
        message: 'Excel 파일이 성공적으로 처리되었습니다',
        rows_processed: mockCount
      };
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('event_code', eventCode);
    
    const response = await api.post('/registration/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Download registration template
  downloadTemplate: () => {
    // This would typically be a static file or generated on the server
    // For now, we'll just return a URL to a template file
    return `${api.defaults.baseURL}/registration/template`;
  },

  // Update a registration
  updateRegistration: async (eventCode, phone, registrationData) => {
    console.log('Updating registration for event:', eventCode, 'phone:', phone, registrationData);
    
    try {
      const payload = {
        partition_key: eventCode,
        sort_key: phone,
        name: registrationData.name,
        email: registrationData.email
      };
      
      const response = await api.put('/registration', payload);
      console.log('Update registration API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update registration API error:', error);
      // Fallback to mock data if API fails
      if (config.USE_MOCK_DATA) {
        console.log('Falling back to mock registration data');
        if (!mockRegistrations[eventCode]) {
          throw new Error('Event not found');
        }
        
        const index = mockRegistrations[eventCode].findIndex(r => r.phone === phone);
        if (index === -1) {
          throw new Error('Registration not found');
        }
        
        mockRegistrations[eventCode][index] = {
          ...mockRegistrations[eventCode][index],
          ...registrationData
        };
        
        return { ...mockRegistrations[eventCode][index], event_code: eventCode };
      }
      throw error;
    }
  }
};

export default registrationService;