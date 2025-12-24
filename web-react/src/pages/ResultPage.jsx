import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getGroupConfig } from '../config/groups';

export default function ResultPage() {
  const { groupCode = 'sls', eventCode = 'test' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const config = getGroupConfig(groupCode);
  
  // location.state에서 데이터 가져오기
  const name = location.state?.name;
  const count = location.state?.count;

  // 데이터가 없으면 체크인 페이지로 리다이렉트
  useEffect(() => {
    if (!name || !count) {
      navigate(`/${groupCode}/${eventCode}`);
    }
  }, [name, count, groupCode, eventCode, navigate]);

  if (!name || !count) {
    return null;
  }

  return (
    <div 
      className="container"
      style={{
        '--primary-color': config.theme.primaryColor,
        '--secondary-color': config.theme.secondaryColor
      }}
    >
      <div className="success-container">
        {config.features.showWelcomeImage && (
          <img 
            src={config.features.welcomeImage} 
            alt="Welcome" 
            className="welcome-image"
          />
        )}
        <h2 className="welcome-message">
          {name}님은 우리 소모임에<br />
          총 {count}번 출석하셨어요!
        </h2>
        <p className="sub-message">다음에도 와주세요 😊</p>
        <br />
        <button 
          className="button" 
          onClick={() => navigate(`/${groupCode}/${eventCode}`)}
        >
          처음으로
        </button>
      </div>
    </div>
  );
}

