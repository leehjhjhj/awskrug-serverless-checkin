import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';

export default function CheckInForm({ eventCode, groupCode }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          phone: phoneNumber,
          event_code: eventCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '서버 오류가 발생했습니다.');
      }

      // 결과 페이지로 이동
      navigate(`/${groupCode}/${eventCode}/result`, {
        state: {
          name: data.name,
          count: data.count
        }
      });

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    // 숫자만 입력 가능
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(value);
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="tel"
          className="input"
          placeholder="핸드폰 번호를 입력하세요"
          pattern="[0-9]*"
          inputMode="numeric"
          value={phoneNumber}
          onChange={handlePhoneChange}
          required
          disabled={loading}
        />
        <button type="submit" className="button" disabled={loading}>
          <span className={`button-text ${loading ? 'loading' : ''}`}>
            출석체크
          </span>
          {loading && <div className="spinner" />}
        </button>
      </form>
    </>
  );
}

