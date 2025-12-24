// 소모임 설정
export const GROUP_CONFIGS = {
  sls: {
    id: 'sls',
    name: 'AWSKRUG 서버리스 소모임',
    title: 'AWSKRUG 서버리스 소모임 출석체크',
    logo: '/images/organization_logo/logo.png',
    description: '출석체크를 위해 등록하신 핸드폰 번호를 입력해주세요!',
    subDescription: '제출하신 번호는 출석 체크 용도로만 사용됩니다.',
    theme: {
      primaryColor: '#FF9900',
      secondaryColor: '#232F3E',
      logoWidth: '200px',
      logoMargin: '0 0 2rem 0'
    },
    features: {
      showWelcomeImage: true,
      welcomeImage: '/images/welcome.png'
    }
  },
  
  ausg: {
    id: 'ausg',
    name: 'AUSG 빅챗',
    title: 'AUSG 빅챗 출석체크',
    logo: '/images/organization_logo/ausg.png',
    description: '출석체크를 위해 등록하신 핸드폰 번호를 입력해주세요!',
    subDescription: '제출하신 번호는 출석 체크 용도로만 사용됩니다.',
    theme: {
      primaryColor: '#4CAF50',
      secondaryColor: '#388E3C',
      logoWidth: '300px',
      logoMargin: '3rem 0 3rem 0'
    },
    features: {
      showWelcomeImage: false
    }
  },
  
  cert: {
    id: 'cert',
    name: 'AWSKRUG 자격증 소모임',
    title: 'AWSKRUG 자격증 소모임 출석체크',
    logo: '/images/organization_logo/cert.png',
    description: '출석체크를 위해 등록하신 핸드폰 번호를 입력해주세요!',
    subDescription: '제출하신 번호는 출석 체크 용도로만 사용됩니다.',
    theme: {
      primaryColor: '#2196F3',
      secondaryColor: '#1976D2',
      logoWidth: '250px',
      logoMargin: '0 0 2rem 0'
    },
    features: {
      showWelcomeImage: false
    }
  }
};

// 기본 설정
export const DEFAULT_GROUP = 'sls';

// 헬퍼 함수
export const getGroupConfig = (groupCode) => {
  return GROUP_CONFIGS[groupCode] || GROUP_CONFIGS[DEFAULT_GROUP];
};

export const getAllGroups = () => {
  return Object.values(GROUP_CONFIGS);
};

export const isValidGroup = (groupCode) => {
  return groupCode in GROUP_CONFIGS;
};

