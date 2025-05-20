// 전화번호 마스킹 처리
export const maskPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
};

// 날짜 포맷팅
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 출석률 계산
export const calculateAttendanceRate = (registrations, checkins) => {
  if (!registrations || registrations === 0) return 0;
  return ((checkins / registrations) * 100).toFixed(1);
};
