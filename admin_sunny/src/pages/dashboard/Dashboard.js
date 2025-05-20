import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import eventService from '../../services/eventService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalCheckins: 0
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      
      // Sort events by date (most recent first)
      const sortedEvents = data.sort((a, b) => 
        new Date(b.event_date_time) - new Date(a.event_date_time)
      );
      
      setEvents(sortedEvents);
      
      // Calculate basic stats
      setStats({
        totalEvents: data.length,
        totalRegistrations: 0, // This would come from an API call in a real implementation
        totalCheckins: 0 // This would come from an API call in a real implementation
      });
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => new Date(event.event_date_time) > now);
  };

  const getRecentEvents = () => {
    return events.slice(0, 5); // Get the 5 most recent events
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        대시보드
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText'
            }}
          >
            <EventIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.totalEvents}</Typography>
            <Typography variant="subtitle1">총 이벤트</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'secondary.light',
              color: 'secondary.contrastText'
            }}
          >
            <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.totalRegistrations}</Typography>
            <Typography variant="subtitle1">총 등록자</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'success.contrastText'
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.totalCheckins}</Typography>
            <Typography variant="subtitle1">총 체크인</Typography>
          </Paper>
        </Grid>

        {/* Recent Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              최근 이벤트
            </Typography>
            <List>
              {getRecentEvents().length > 0 ? (
                getRecentEvents().map((event, index) => (
                  <React.Fragment key={event.event_code}>
                    <ListItem
                      button
                      onClick={() => navigate(`/events/${event.event_code}`)}
                    >
                      <ListItemText
                        primary={event.event_name}
                        secondary={new Date(event.event_date_time).toLocaleString('ko-KR')}
                      />
                    </ListItem>
                    {index < getRecentEvents().length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="이벤트가 없습니다." />
                </ListItem>
              )}
            </List>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/events')}
              >
                모든 이벤트 보기
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              다가오는 이벤트
            </Typography>
            <List>
              {getUpcomingEvents().length > 0 ? (
                getUpcomingEvents().slice(0, 5).map((event, index) => (
                  <React.Fragment key={event.event_code}>
                    <ListItem
                      button
                      onClick={() => navigate(`/events/${event.event_code}`)}
                    >
                      <ListItemText
                        primary={event.event_name}
                        secondary={new Date(event.event_date_time).toLocaleString('ko-KR')}
                      />
                    </ListItem>
                    {index < getUpcomingEvents().slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="다가오는 이벤트가 없습니다." />
                </ListItem>
              )}
            </List>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => navigate('/events/new')}
              >
                새 이벤트 생성
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {loading && <div>로딩 중...</div>}
    </Box>
  );
};

export default Dashboard;