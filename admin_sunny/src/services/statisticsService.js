import api from './api';

// 이벤트별 Retention Rate 조회
export const getEventRetention = async (eventCode) => {
  try {
    const response = await api.get(`/statistics/event/${eventCode}/retention`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching retention for event ${eventCode}:`, error);
    throw error;
  }
};

// 조직별 전체 통계 조회
export const getOrganizationStats = async (organizationCode) => {
  try {
    const response = await api.get(`/statistics/organization/${organizationCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for organization ${organizationCode}:`, error);
    throw error;
  }
};

// 이벤트 버전별 통계 조회
export const getEventVersionStats = async (eventVersion) => {
  try {
    const response = await api.get(`/statistics/event-version/${eventVersion}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for event version ${eventVersion}:`, error);
    throw error;
  }
};

export default {
  getEventRetention,
  getOrganizationStats,
  getEventVersionStats
};
