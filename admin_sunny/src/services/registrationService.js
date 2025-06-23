import api from './api';
import config from '../config';
import { mockRegistrations } from './mockData';

const registrationService = {
  // Get all registrations for an event
  getRegistrations: async (eventCode) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock registration data');
      const registrations = mockRegistrations[eventCode] || [];
      return registrations;
    }
    
    const response = await api.get(`/admin/event/${eventCode}/registrations`);
    return response.data;
  },

  // Add a single registration to an event
  addRegistration: async (eventCode, registrationData) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock registration data');
      // Generate a random hash for phone
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
    
    const response = await api.post(`/admin/event/${eventCode}/registration`, registrationData);
    return response.data;
  },

  // Delete a registration
  deleteRegistration: async (eventCode, phone) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock registration data');
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
    
    const response = await api.delete(`/admin/event/${eventCode}/registration/${phone}`);
    return response.data;
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
    
    const response = await api.post('/admin/registration/upload', formData, {
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
    return `${api.defaults.baseURL}/admin/registration/template`;
  }
};

export default registrationService;