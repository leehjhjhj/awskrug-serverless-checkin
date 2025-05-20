const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://api.example.com',
  ENV: process.env.REACT_APP_ENV || 'local',
  USE_MOCK_DATA: process.env.REACT_APP_ENV === 'local' || true,
};

export default config;