import api from './api';

// Mock data for events
const mockEvents = [
  {
    event_code: 'event1',
    event_name: '2023년 1월 정기 모임',
    group_code: 'awskrug',
    group_name: 'AWS 한국 사용자 모임',
    event_date_time: '2023-01-15T18:00:00',
    code_expired_at: '2023-01-15T21:00:00',
    description: 'AWS 서비스 업데이트 및 사용 사례 공유',
    qr_url: 'https://via.placeholder.com/150',
    registrations: 85,
    checkins: 72
  },
  {
    event_code: 'event2',
    event_name: '대학생을 위한 AWS 입문',
    group_code: 'ausg',
    group_name: 'AWSKRUG 대학생 모임',
    event_date_time: '2023-02-15T14:00:00',
    code_expired_at: '2023-02-15T17:00:00',
    description: '대학생을 위한 AWS 클라우드 기초 교육',
    qr_url: 'https://via.placeholder.com/150',
    registrations: 45,
    checkins: 38
  },
  {
    event_code: 'event3',
    event_name: 'Serverless 아키텍처 워크샵',
    group_code: 'serverless',
    group_name: 'Serverless Korea',
    event_date_time: '2023-03-15T19:00:00',
    code_expired_at: '2023-03-15T22:00:00',
    description: 'AWS Lambda와 API Gateway를 활용한 서버리스 애플리케이션 개발',
    qr_url: 'https://via.placeholder.com/150',
    registrations: 60,
    checkins: 52
  }
];

// 모든 이벤트 목록 조회
export const getAllEvents = async (groupCode = null) => {
  try {
    const response = await api.get('/event');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// 특정 이벤트 상세 정보 조회
export const getEventByCode = async (eventCode) => {
  try {
    const response = await api.get(`/event/${eventCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventCode}:`, error);
    throw error;
  }
};

// 새 이벤트 생성
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/event', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// 이벤트 정보 업데이트
export const updateEvent = async (eventCode, eventData) => {
  try {
    const response = await api.put('/event', { ...eventData, event_code: eventCode });
    return response.data;
  } catch (error) {
    console.error(`Error updating event ${eventCode}:`, error);
    throw error;
  }
};

// 이벤트 삭제
export const deleteEvent = async (eventCode) => {
  try {
    await api.delete('/event', { data: { event_code: eventCode } });
    return true;
  } catch (error) {
    console.error(`Error deleting event ${eventCode}:`, error);
    throw error;
  }
};

// 이벤트 코드 만료 설정
export const expireEventCode = async (eventCode) => {
  try {
    // 실제 API 연동 시 아래 주석 해제
    // await api.post(`/events/${eventCode}/expire`);
    // return true;
    
    // Mock data 사용
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const eventIndex = mockEvents.findIndex(e => e.event_code === eventCode);
        if (eventIndex !== -1) {
          console.log(`Expiring event code ${eventCode}`);
          resolve(true);
        } else {
          reject(new Error('Event not found'));
        }
      }, 500);
    });
  } catch (error) {
    console.error(`Error expiring event code ${eventCode}:`, error);
    throw error;
  }
};

// 이벤트 통계 조회
export const getEventStats = async (eventCode) => {
  try {
    // 실제 API 연동 시 아래 주석 해제
    // const response = await api.get(`/events/${eventCode}/stats`);
    // return response.data;
    
    // Mock data 사용
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const event = mockEvents.find(e => e.event_code === eventCode);
        if (event) {
          const mockStats = {
            registrations: event.registrations,
            checkins: event.checkins,
            attendanceRate: Math.round((event.checkins / event.registrations) * 100),
            timeDistribution: [
              { name: '정시 참석', value: 75 },
              { name: '10분 이내 지각', value: 15 },
              { name: '30분 이내 지각', value: 7 },
              { name: '30분 이상 지각', value: 3 }
            ],
            hourlyCheckins: [
              { hour: '17:00', count: 5 },
              { hour: '17:30', count: 12 },
              { hour: '18:00', count: 35 },
              { hour: '18:30', count: 15 },
              { hour: '19:00', count: 5 }
            ]
          };
          resolve(mockStats);
        } else {
          reject(new Error('Event not found'));
        }
      }, 500);
    });
  } catch (error) {
    console.error(`Error fetching stats for event ${eventCode}:`, error);
    throw error;
  }
};

export default {
  getAllEvents,
  getEventByCode,
  createEvent,
  updateEvent,
  deleteEvent,
  expireEventCode,
  getEventStats
};