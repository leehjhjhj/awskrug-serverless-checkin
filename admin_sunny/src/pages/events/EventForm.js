import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock data for groups
const mockGroups = [
  { group_code: 'awskrug', group_name: 'AWS 한국 사용자 모임' },
  { group_code: 'ausg', group_name: 'AWSKRUG 대학생 모임' },
  { group_code: 'serverless', group_name: 'Serverless Korea' }
];

// Mock data for a single event
const mockEvent = {
  event_code: 'event123',
  event_name: '2023년 7월 정기 모임',
  group_code: 'awskrug',
  event_date_time: '2023-07-15T18:00:00',
  code_expired_at: '2023-07-15T21:00:00',
  description: 'AWS 서비스 업데이트 및 사용 사례 공유',
  qr_url: 'https://via.placeholder.com/150'
};

const EventForm = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!eventCode;
  
  const [formData, setFormData] = useState({
    event_code: '',
    event_name: '',
    group_code: '',
    event_date_time: dayjs(),
    code_expired_at: dayjs().add(3, 'hour'),
    description: '',
    qr_url: ''
  });
  
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [autoExpire, setAutoExpire] = useState(true);

  useEffect(() => {
    // Fetch groups
    const fetchGroups = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setGroups(mockGroups);
        }, 300);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();

    // If in edit mode, fetch event data
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          // In a real app, this would be an API call
          setTimeout(() => {
            const event = {
              ...mockEvent,
              event_date_time: dayjs(mockEvent.event_date_time),
              code_expired_at: dayjs(mockEvent.code_expired_at)
            };
            setFormData(event);
            setLoading(false);
          }, 500);
        } catch (error) {
          console.error('Error fetching event:', error);
          setError('이벤트 정보를 불러오는데 실패했습니다.');
          setLoading(false);
        }
      };

      fetchEvent();
    }
  }, [isEditMode, eventCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If auto expire is enabled, set expiration to 3 hours after event start
    if (name === 'event_date_time' && autoExpire) {
      setFormData(prev => ({
        ...prev,
        code_expired_at: value.add(3, 'hour')
      }));
    }
  };

  const handleAutoExpireChange = (e) => {
    const checked = e.target.checked;
    setAutoExpire(checked);
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        code_expired_at: prev.event_date_time.add(3, 'hour')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', formData);
      setSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/events');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('이벤트 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <Box sx={{ p: 3 }}>로딩 중...</Box>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h1">
            {isEditMode ? '이벤트 수정' : '새 이벤트 등록'}
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/events')}
          >
            목록으로
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            이벤트가 성공적으로 저장되었습니다.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="이벤트 코드"
                name="event_code"
                value={formData.event_code}
                onChange={handleChange}
                disabled={isEditMode}
                helperText={isEditMode ? "이벤트 코드는 수정할 수 없습니다" : "영문, 숫자, 하이픈만 사용 가능"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="이벤트 이름"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>소모임</InputLabel>
                <Select
                  name="group_code"
                  value={formData.group_code}
                  label="소모임"
                  onChange={handleChange}
                >
                  {groups.map((group) => (
                    <MenuItem key={group.group_code} value={group.group_code}>
                      {group.group_name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>이벤트가 속한 소모임을 선택하세요</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="이벤트 일시"
                value={formData.event_date_time}
                onChange={(value) => handleDateChange('event_date_time', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <DateTimePicker
                  label="코드 만료 시간"
                  value={formData.code_expired_at}
                  onChange={(value) => handleDateChange('code_expired_at', value)}
                  disabled={autoExpire}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoExpire}
                      onChange={handleAutoExpireChange}
                    />
                  }
                  label="이벤트 시작 3시간 후 자동 만료"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="설명"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EventForm;