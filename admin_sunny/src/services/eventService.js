import api from './api';
import config from '../config';
import { mockEvents, mockStats } from './mockData';

const eventService = {
  // Get all events with optional date filtering
  getAllEvents: async (startDate, endDate) => {
    // Use mock data if in local environment
    if (config.USE_MOCK_DATA) {
      console.log('Using mock event data');
      let filteredEvents = [...mockEvents];
      
      if (startDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.event_date_time) >= new Date(startDate)
        );
      }
      
      if (endDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.event_date_time) <= new Date(endDate)
        );
      }
      
      return filteredEvents;
    }
    
    // Use real API in production
    let url = '/admin/events';
    const params = {};
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get(url, { params });
    return response.data;
  },

  // Get a single event by code
  getEvent: async (eventCode) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock event data');
      const event = mockEvents.find(e => e.event_code === eventCode);
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    }
    
    const response = await api.get(`/admin/event/${eventCode}`);
    return response.data;
  },

  // Create a new event
  createEvent: async (eventData) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock event data');
      // Generate a random event code
      const eventCode = 'EVT' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newEvent = {
        ...eventData,
        event_code: eventCode,
        qr_url: `https://example.com/qr/${eventCode}`
      };
      mockEvents.push(newEvent);
      return newEvent;
    }
    
    const response = await api.post('/admin/event', eventData);
    return response.data;
  },

  // Update an existing event
  updateEvent: async (eventCode, eventData) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock event data');
      const index = mockEvents.findIndex(e => e.event_code === eventCode);
      if (index === -1) {
        throw new Error('Event not found');
      }
      mockEvents[index] = { ...mockEvents[index], ...eventData };
      return mockEvents[index];
    }
    
    const response = await api.put(`/admin/event/${eventCode}`, eventData);
    return response.data;
  },

  // Delete an event
  deleteEvent: async (eventCode) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock event data');
      const index = mockEvents.findIndex(e => e.event_code === eventCode);
      if (index === -1) {
        throw new Error('Event not found');
      }
      mockEvents.splice(index, 1);
      return { message: '이벤트가 성공적으로 삭제되었습니다' };
    }
    
    const response = await api.delete(`/admin/event/${eventCode}`);
    return response.data;
  },

  // Get event statistics
  getEventStats: async (eventCode) => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock stats data');
      const stats = mockStats[eventCode];
      if (!stats) {
        throw new Error('Stats not found');
      }
      return stats;
    }
    
    const response = await api.get(`/admin/event/${eventCode}/stats`);
    return response.data;
  },

  // Export event data
  exportEventData: async (eventCode, format = 'excel') => {
    if (config.USE_MOCK_DATA) {
      console.log('Using mock export data');
      // In a real implementation, this would return a blob
      // For mock, we'll just return a dummy blob
      return new Blob(['Mock export data'], { type: 'text/plain' });
    }
    
    const response = await api.get(`/admin/event/${eventCode}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default eventService;