import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock data
const mockGroup = {
  group_code: 'awskrug',
  group_name: 'AWS 한국 사용자 모임',
  description: 'AWS 클라우드 기술을 공유하는 한국 사용자 모임',
  created_at: '2020-01-01',
  logo_url: 'https://via.placeholder.com/150',
  event_count: 24,
  member_count: 1200
};

const mockEvents = [
  {
    event_code: 'event1',
    event_name: '2023년 1월 정기 모임',
    event_date_time: '2023-01-15T18:00:00',
    registrations: 85,
    checkins: 72
  },
  {
    event_code: 'event2',
    event_name: '2023년 2월 정기 모임',
    event_date_time: '2023-02-15T18:00:00',
    registrations: 92,
    checkins: 78
  },
  {
    event_code: 'event3',
    event_name: '2023년 3월 정기 모임',
    event_date_time: '2023-03-15T18:00:00',
    registrations: 105,
    checkins: 89
  }
];

const GroupDetail = () => {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Simulate API calls
    const fetchData = async () => {
      try {
        // In a real app, these would be API calls
        setTimeout(() => {
          setGroup(mockGroup);
          setEvents(mockEvents);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, [groupCode]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>로딩 중...</Box>;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!group) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">소모임을 찾을 수 없습니다.</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/groups')}
        >
          목록으로
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          component={Link}
          to={`/groups/${groupCode}/edit`}
        >
          수정
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <img 
                src={group.logo_url} 
                alt={group.group_name} 
                style={{ height: 150, objectFit: 'contain', marginBottom: 16 }}
              />
              <Typography variant="h5" component="h1" gutterBottom align="center">
                {group.group_name}
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                {group.description}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="소모임 코드" 
                  secondary={group.group_code} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="생성일" 
                  secondary={new Date(group.created_at).toLocaleDateString()} 
                />
              </ListItem>
              <ListItem>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<EventIcon />} 
                    label={`이벤트 ${group.event_count}개`} 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<PeopleIcon />} 
                    label={`회원 ${group.member_count}명`} 
                    color="secondary" 
                    variant="outlined"
                  />
                </Box>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                startIcon={<EventIcon />}
                component={Link}
                to={`/events?group=${groupCode}`}
              >
                이벤트 보기
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<BarChartIcon />}
                component={Link}
                to={`/groups/${groupCode}/stats`}
              >
                통계 보기
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="최근 이벤트" />
                <Tab label="통계 요약" />
              </Tabs>
            </Box>
            
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  최근 이벤트
                </Typography>
                
                {events.length === 0 ? (
                  <Alert severity="info">이벤트가 없습니다.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {events.map((event) => (
                      <Grid item xs={12} key={event.event_code}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="h6">
                                  {event.event_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(event.event_date_time).toLocaleString()}
                                </Typography>
                              </Box>
                              <Box>
                                <Chip 
                                  label={`등록: ${event.registrations}명`} 
                                  size="small" 
                                  color="primary" 
                                  sx={{ mr: 1 }}
                                />
                                <Chip 
                                  label={`참석: ${event.checkins}명`} 
                                  size="small" 
                                  color="success" 
                                />
                              </Box>
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                              <Button 
                                size="small" 
                                component={Link} 
                                to={`/events/${event.event_code}`}
                              >
                                상세 보기
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  통계 요약
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1">평균 참석률</Typography>
                      <Typography variant="h4" color="primary">85%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        전체 등록 대비 참석 비율
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1">평균 참석자 수</Typography>
                      <Typography variant="h4" color="secondary">78명</Typography>
                      <Typography variant="body2" color="text.secondary">
                        이벤트당 평균 참석자 수
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        component={Link} 
                        to={`/groups/${groupCode}/stats`}
                      >
                        상세 통계 보기
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GroupDetail;