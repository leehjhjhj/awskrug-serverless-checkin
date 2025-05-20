import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import eventService from '../../services/eventService';

const EventForm = () => {
  const navigate = useNavigate();
  const { eventCode } = useParams();
  const isEditMode = Boolean(eventCode);
  
  const [formData, setFormData] = useState({
    event_name: '',
    event_date_time: dayjs(),
    code_expired_at: dayjs().add(1, 'day'),
    description: '',
    event_version: '1.0'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchEvent();
    }
  }, [eventCode]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const event = await eventService.getEvent(eventCode);
      setFormData({
        ...event,
        event_date_time: dayjs(event.event_date_time),
        code_expired_at: dayjs(event.code_expired_at)
      });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      setError('이벤트 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const eventData = {
        ...formData,
        event_date_time: formData.event_date_time.toISOString(),
        code_expired_at: formData.code_expired_at.toISOString()
      };
      
      let result;
      if (isEditMode) {
        result = await eventService.updateEvent(eventCode, eventData);
      } else {
        result = await eventService.createEvent(eventData);
      }
      
      // Navigate to event detail page after successful creation/update
      navigate(`/events/${result.event_code || eventCode}`);
      
    } catch (error) {
      console.error('Failed to save event:', error);
      setError(`이벤트 ${isEditMode ? '수정' : '생성'}에 실패했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {isEditMode ? '이벤트 수정' : '새 이벤트 생성'}
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="event_name"
                label="이벤트 이름"
                fullWidth
                required
                value={formData.event_name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="이벤트 일시"
                  value={formData.event_date_time}
                  onChange={handleDateChange('event_date_time')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="코드 만료 일시"
                  value={formData.code_expired_at}
                  onChange={handleDateChange('code_expired_at')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="이벤트 설명"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="event_version"
                label="이벤트 버전"
                fullWidth
                value={formData.event_version}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/events')}
                  disabled={loading}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? '처리 중...' : isEditMode ? '수정' : '생성'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EventForm;