import api from './api';
import config from '../config';
import { mockCheckins, mockRegistrations } from './mockData';

const checkinService = {
  // Get checkin by phone and event code
  getCheckin: async (phone, eventCode) => {
    console.log('Fetching checkin for phone:', phone, 'event:', eventCode);
    
    try {
      const response = await api.get('/checkin', { 
        params: { 
          phone: phone,
          event_code: eventCode 
        } 
      });
      console.log('Checkin API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Checkin API error:', error);
      // Fallback to mock data if API fails
      if (config.USE_MOCK_DATA) {
        console.log('Falling back to mock checkin data');
        const checkins = mockCheckins[eventCode] || [];
        const checkin = checkins.find(c => c.phone === phone);
        if (!checkin) {
          throw new Error('Checkin not found');
        }
        return checkin;
      }
      throw error;
    }
  },

  // Create a new checkin
  createCheckin: async (checkinData) => {
    console.log('Creating checkin:', checkinData);
    
    try {
      const payload = {
        phone: checkinData.phone,
        event_code: checkinData.event_code,
        email: checkinData.email,
        name: checkinData.name,
        checked_at: checkinData.checked_at || new Date().toISOString(),
        event_version: checkinData.event_version
      };
      
      const response = await api.post('/checkin', payload);
      console.log('Create checkin API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create checkin API error:', error);
      // Fallback to mock data if API fails
      if (config.USE_MOCK_DATA) {
        console.log('Falling back to mock checkin data');
        if (!mockCheckins[checkinData.event_code]) {
          mockCheckins[checkinData.event_code] = [];
        }
        
        const newCheckin = {
          ...checkinData,
          checked_at: checkinData.checked_at || new Date().toISOString()
        };
        
        mockCheckins[checkinData.event_code].push(newCheckin);
        return newCheckin;
      }
      throw error;
    }
  },

  // Delete a checkin
  deleteCheckin: async (phone, eventCode) => {
    console.log('Deleting checkin for phone:', phone, 'event:', eventCode);
    
    try {
      const payload = {
        phone: phone,
        event_code: eventCode
      };
      
      const response = await api.delete('/checkin', { data: payload });
      console.log('Delete checkin API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete checkin API error:', error);
      // Fallback to mock data if API fails
      if (config.USE_MOCK_DATA) {
        console.log('Falling back to mock checkin data');
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
      throw error;
    }
  },

  // Update a checkin
  updateCheckin: async (phone, eventCode, checkinData) => {
    console.log('Updating checkin for phone:', phone, 'event:', eventCode, checkinData);
    
    try {
      const payload = {
        phone: phone,
        event_code: eventCode,
        email: checkinData.email,
        name: checkinData.name,
        checked_at: checkinData.checked_at,
        event_version: checkinData.event_version
      };
      
      const response = await api.put('/checkin', payload);
      console.log('Update checkin API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update checkin API error:', error);
      // Fallback to mock data if API fails
      if (config.USE_MOCK_DATA) {
        console.log('Falling back to mock checkin data');
        if (!mockCheckins[eventCode]) {
          throw new Error('Event not found');
        }
        
        const index = mockCheckins[eventCode].findIndex(c => c.phone === phone);
        if (index === -1) {
          throw new Error('Checkin not found');
        }
        
        mockCheckins[eventCode][index] = {
          ...mockCheckins[eventCode][index],
          ...checkinData
        };
        
        return mockCheckins[eventCode][index];
      }
      throw error;
    }
  }
};

export default checkinService;