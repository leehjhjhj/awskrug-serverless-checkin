import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Tabs, Tab, Divider
} from '@mui/material';
import eventService from '../../services/eventService';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingBackdrop from '../../components/common/LoadingBackdrop';

const EventDetail = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchEvent();
  }, [eventCode]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvent(eventCode);
      setEvent(data);
    } catch (error) {
      setAlert({
        open: true,
        message: '이벤트 정보를 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Navigate to appropriate tab
    switch(newValue) {
      case 0: // Details
        navigate(`/events/${eventCode}`);
        break;
      case 1: // Registrations
        navigate(`/events/${eventCode}/registrations`);
        break;
      case 2: // Checkins
        navigate(`/events/${eventCode}/checkins`);
        break;
      case 3: // Stats
        navigate(`/events/${eventCode}/stats`);
        break;
      default:
        navigate(`/events/${eventCode}`);
    }
  };

  if (loading) {
    return <LoadingBackdrop open={loading} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          이벤트 상세 정보
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/events/${eventCode}/edit`)}
        >
          이벤트 수정
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="상세 정보" />
          <Tab label="등록자 관리" />
          <Tab label="체크인 관리" />
          <Tab label="통계" />
        </Tabs>
      </Paper>

      {event && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">이벤트 코드</Typography>
              <Typography variant="body1">{event.event_code}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">이벤트 이름</Typography>
              <Typography variant="body1">{event.event_name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">이벤트 일시</Typography>
              <Typography variant="body1">
                {new Date(event.event_date_time).toLocaleString('ko-KR')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">코드 만료 일시</Typography>
              <Typography variant="body1">
                {new Date(event.code_expired_at).toLocaleString('ko-KR')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">이벤트 설명</Typography>
              <Typography variant="body1">{event.description || '설명 없음'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">이벤트 버전</Typography>
              <Typography variant="body1">{event.event_version}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold">QR 코드</Typography>
              {event.qr_url ? (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img 
                    src={event.qr_url} 
                    alt="Event QR Code" 
                    style={{ maxWidth: '200px' }} 
                  />
                </Box>
              ) : (
                <Typography variant="body1">QR 코드가 없습니다.</Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      <AlertMessage
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        severity={alert.severity}
        message={alert.message}
      />
    </Box>
  );
};

export default EventDetail;