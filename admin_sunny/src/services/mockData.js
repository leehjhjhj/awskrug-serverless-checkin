// Mock data for local development

export const mockEvents = [
  {
    event_code: 'EVT001',
    event_name: 'AWS 서버리스 워크샵',
    event_date_time: '2023-12-15T14:00:00Z',
    description: 'AWS 서버리스 아키텍처에 대한 워크샵',
    qr_url: 'https://example.com/qr/EVT001',
    code_expired_at: '2023-12-15T18:00:00Z',
    event_version: '1.0'
  },
  {
    event_code: 'EVT002',
    event_name: 'AWS 컨테이너 세미나',
    event_date_time: '2024-01-20T15:00:00Z',
    description: 'AWS ECS 및 EKS에 대한 세미나',
    qr_url: 'https://example.com/qr/EVT002',
    code_expired_at: '2024-01-20T19:00:00Z',
    event_version: '1.0'
  },
  {
    event_code: 'EVT003',
    event_name: 'AWS 데이터베이스 특강',
    event_date_time: '2024-02-10T13:00:00Z',
    description: 'AWS 데이터베이스 서비스에 대한 특강',
    qr_url: 'https://example.com/qr/EVT003',
    code_expired_at: '2024-02-10T17:00:00Z',
    event_version: '1.0'
  }
];

export const mockRegistrations = {
  'EVT001': [
    { phone: 'hash1', name: '김철수', email: 'kim@example.com' },
    { phone: 'hash2', name: '이영희', email: 'lee@example.com' },
    { phone: 'hash3', name: '박지민', email: 'park@example.com' }
  ],
  'EVT002': [
    { phone: 'hash4', name: '최동욱', email: 'choi@example.com' },
    { phone: 'hash5', name: '정미영', email: 'jung@example.com' }
  ],
  'EVT003': [
    { phone: 'hash6', name: '한지수', email: 'han@example.com' },
    { phone: 'hash7', name: '오민준', email: 'oh@example.com' },
    { phone: 'hash8', name: '서유진', email: 'seo@example.com' },
    { phone: 'hash9', name: '임수빈', email: 'lim@example.com' }
  ]
};

export const mockCheckins = {
  'EVT001': [
    { phone: 'hash1', name: '김철수', email: 'kim@example.com', checked_at: '2023-12-15T14:10:23Z' },
    { phone: 'hash2', name: '이영희', email: 'lee@example.com', checked_at: '2023-12-15T14:15:45Z' }
  ],
  'EVT002': [
    { phone: 'hash4', name: '최동욱', email: 'choi@example.com', checked_at: '2024-01-20T15:05:12Z' }
  ],
  'EVT003': []
};

export const mockStats = {
  'EVT001': {
    event_name: 'AWS 서버리스 워크샵',
    event_date_time: '2023-12-15T14:00:00Z',
    total_registrations: 3,
    total_checkins: 2,
    attendance_rate: 66.7
  },
  'EVT002': {
    event_name: 'AWS 컨테이너 세미나',
    event_date_time: '2024-01-20T15:00:00Z',
    total_registrations: 2,
    total_checkins: 1,
    attendance_rate: 50.0
  },
  'EVT003': {
    event_name: 'AWS 데이터베이스 특강',
    event_date_time: '2024-02-10T13:00:00Z',
    total_registrations: 4,
    total_checkins: 0,
    attendance_rate: 0.0
  }
};