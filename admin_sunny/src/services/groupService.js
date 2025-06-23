import api from './api';

// Mock data for groups
const mockGroups = [
  {
    group_code: 'awskrug',
    group_name: 'AWS 한국 사용자 모임',
    description: 'AWS 클라우드 기술을 공유하는 한국 사용자 모임',
    created_at: '2020-01-01',
    logo_url: 'https://via.placeholder.com/150',
    event_count: 24,
    member_count: 1200
  },
  {
    group_code: 'ausg',
    group_name: 'AWSKRUG 대학생 모임',
    description: '대학생을 위한 AWS 클라우드 기술 학습 모임',
    created_at: '2021-03-15',
    logo_url: 'https://via.placeholder.com/150',
    event_count: 12,
    member_count: 350
  },
  {
    group_code: 'serverless',
    group_name: 'Serverless Korea',
    description: '서버리스 아키텍처와 기술을 공유하는 모임',
    created_at: '2022-05-20',
    logo_url: 'https://via.placeholder.com/150',
    event_count: 8,
    member_count: 180
  }
];

// 모든 소모임 목록 조회
export const getAllGroups = async () => {
  try {
    // 실제 API 연동 시 아래 주석 해제
    // const response = await api.get('/groups');
    // return response.data;
    
    // Mock data 사용
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockGroups);
      }, 300);
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

// 특정 소모임 상세 정보 조회
export const getGroupByCode = async (groupCode) => {
  try {
    // 실제 API 연동 시 아래 주석 해제
    // const response = await api.get(`/groups/${groupCode}`);
    // return response.data;
    
    // Mock data 사용
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const group = mockGroups.find(g => g.group_code === groupCode);
        if (group) {
          resolve(group);
        } else {
          reject(new Error('Group not found'));
        }
      }, 300);
    });
  } catch (error) {
    console.error(`Error fetching group ${groupCode}:`, error);
    throw error;
  }
};

// 새 소모임 생성
export const createGroup = async (groupData) => {
  try {
    // 실제 API 연동 시 아래 주석 해제
    // const response = await api.post('/groups', groupData);
    // return response.data;
    
    // Mock data 사용
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Creating group:', groupData);
        resolve({
          ...groupData,
          created_at: new Date().toISOString(),
          event_count: 0,
          member_count: 0
        });
      }, 500);
    });
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// 소모임 정보 업데이트
export const updateGroup = async (groupCode, groupData) => {
  try {
    // 실제 API 연동 시 아래 주석 해제
    // const response = await api.put(`/groups/${groupCode}`, groupData);
    // return response.data;
    
    // Mock data 사용
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = mockGroups.findIndex(g => g.group_code === groupCode);
        if (groupIndex !== -1) {
          const updatedGroup = {
            ...mockGroups[groupIndex],
            ...groupData,
            group_code: groupCode // 코드는 변경 불가
          };
          console.log('Updating group:', updatedGroup);
          resolve(updatedGroup);
        } else {
          reject(new Error('Group not found'));
        }
      }, 500);
    });
  } catch (error) {
    console.error(`Error updating group ${groupCode}:`, error);
    throw error;
  }
};

// 소모임 삭제
export const deleteGroup = async (groupCode) => {
  try {
    // 실제 API 연동 시 아래 주석 해제
    // await api.delete(`/groups/${groupCode}`);
    // return true;
    
    // Mock data 사용
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = mockGroups.findIndex(g => g.group_code === groupCode);
        if (groupIndex !== -1) {
          console.log(`Deleting group ${groupCode}`);
          resolve(true);
        } else {
          reject(new Error('Group not found'));
        }
      }, 500);
    });
  } catch (error) {
    console.error(`Error deleting group ${groupCode}:`, error);
    throw error;
  }
};

// 소모임별 통계 조회
export const getGroupStats = async (groupCode, timeRange = '6months') => {
  try {
    // 실제 API 연동 시 아래 주석 해제
    // const response = await api.get(`/groups/${groupCode}/stats`, { params: { timeRange } });
    // return response.data;
    
    // Mock data 사용
    return new Promise((resolve) => {
      setTimeout(() => {
        // 간단한 통계 데이터 생성
        const mockStats = {
          attendanceRate: 85.5,
          averageAttendees: 78,
          onTimeRate: 75,
          attendanceTrend: [
            { name: '1월', 등록: 85, 참석: 72, 참석률: 84.7 },
            { name: '2월', 등록: 92, 참석: 78, 참석률: 84.8 },
            { name: '3월', 등록: 105, 참석: 89, 참석률: 84.8 },
            { name: '4월', 등록: 110, 참석: 95, 참석률: 86.4 },
            { name: '5월', 등록: 98, 참석: 82, 참석률: 83.7 },
            { name: '6월', 등록: 115, 참석: 102, 참석률: 88.7 }
          ],
          timeDistribution: [
            { name: '정시 참석', value: 75 },
            { name: '10분 이내 지각', value: 15 },
            { name: '30분 이내 지각', value: 7 },
            { name: '30분 이상 지각', value: 3 }
          ]
        };
        
        resolve(mockStats);
      }, 500);
    });
  } catch (error) {
    console.error(`Error fetching stats for group ${groupCode}:`, error);
    throw error;
  }
};

// 소모임별 이벤트 목록 조회
export const getGroupEvents = async (groupCode) => {
  try {
    // 실제 API 연동 시 아래 주석 해제
    // const response = await api.get(`/groups/${groupCode}/events`);
    // return response.data;
    
    // Mock data 사용
    return new Promise((resolve) => {
      setTimeout(() => {
        // 간단한 이벤트 데이터 생성
        const mockEvents = [
          {
            event_code: 'event1',
            event_name: '2023년 1월 정기 모임',
            event_date_time: '2023-01-15T18:00:00',
            registrations: 85,
            checkins: 72
          },
          {
            event_code: 'event2',
            event_name: '2023년 2월 정기 모임',
            event_date_time: '2023-02-15T18:00:00',
            registrations: 92,
            checkins: 78
          },
          {
            event_code: 'event3',
            event_name: '2023년 3월 정기 모임',
            event_date_time: '2023-03-15T18:00:00',
            registrations: 105,
            checkins: 89
          }
        ];
        
        resolve(mockEvents);
      }, 300);
    });
  } catch (error) {
    console.error(`Error fetching events for group ${groupCode}:`, error);
    throw error;
  }
};

export default {
  getAllGroups,
  getGroupByCode,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupStats,
  getGroupEvents
};