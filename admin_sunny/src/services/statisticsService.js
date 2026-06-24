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

// 조직별 이벤트 버전 통계 조회
export const getEventVersionStats = async (organizationCode, eventVersion) => {
  try {
    const response = await api.get(`/statistics/organization/${organizationCode}/event-version/${eventVersion}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for organization ${organizationCode} version ${eventVersion}:`, error);
    throw error;
  }
};

// 이벤트 통계 엑셀 다운로드
export const downloadEventStatistics = async (eventCode) => {
  try {
    const response = await api.get(`/statistics/event/${eventCode}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error downloading statistics for event ${eventCode}:`, error);
    throw error;
  }
};

export default {
  getEventRetention,
  getOrganizationStats,
  getEventVersionStats,
  downloadEventStatistics
};
