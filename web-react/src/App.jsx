import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CheckInPage from './pages/CheckInPage';
import ResultPage from './pages/ResultPage';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 소모임 + 이벤트 코드 경로 */}
        <Route path="/:groupCode/:eventCode" element={<CheckInPage />} />
        
        {/* 결과 페이지 */}
        <Route path="/:groupCode/:eventCode/result" element={<ResultPage />} />
        
        {/* 기본 경로 - sls/test로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/sls/test" replace />} />
        
        {/* 404 - 기본 페이지로 */}
        <Route path="*" element={<Navigate to="/sls/test" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

