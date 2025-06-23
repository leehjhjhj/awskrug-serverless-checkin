import api from './api';
import config from '../config';
import { mockCheckins, mockRegistrations } from './mockData';

const checkinService = {
  // Get all checkins for an event
  getCheckins: async (eventCode) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock checkin data');
      const checkins = mockCheckins[eventCode] || [];
      return checkins;
    }
    
    const response = await api.get(`/admin/event/${eventCode}/checkins`);
    return response.data;
  },

  // Manually check in a participant
  manualCheckin: async (eventCode, phone) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock checkin data');
      
      // Find the registration
      if (!mockRegistrations[eventCode]) {
        throw new Error('Event not found');
      }
      
      const registration = mockRegistrations[eventCode].find(r => 
        r.phone === phone || r.phone.includes(phone.substring(phone.length - 4))
      );
      
      if (!registration) {
        throw new Error('Registration not found');
      }
      
      // Check if already checked in
      if (!mockCheckins[eventCode]) {
        mockCheckins[eventCode] = [];
      }
      
      const existingCheckin = mockCheckins[eventCode].find(c => c.phone === registration.phone);
      if (existingCheckin) {
        return { name: registration.name, count: 1 };
      }
      
      // Add new checkin
      const newCheckin = {
        ...registration,
        checked_at: new Date().toISOString()
      };
      
      mockCheckins[eventCode].push(newCheckin);
      return { name: registration.name, count: 1 };
    }
    
    const response = await api.post(`/admin/event/${eventCode}/checkin`, { phone });
    return response.data;
  },

  // Delete a checkin
  deleteCheckin: async (phone, eventCode) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock checkin data');
      if (!mockCheckins[eventCode]) {
        throw new Error('Event not found');
      }
      
      const index = mockCheckins[eventCode].findIndex(c => c.phone === phone);
      if (index === -1) {
        throw new Error('Checkin not found');
      }
      
      mockCheckins[eventCode].splice(index, 1);
      return { message: '체크인이 성공적으로 삭제되었습니다' };
    }
    
    const response = await api.delete(`/admin/checkin/${phone}/${eventCode}`);
    return response.data;
  }
};

export default checkinService;