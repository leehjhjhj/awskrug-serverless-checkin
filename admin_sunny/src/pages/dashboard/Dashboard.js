import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';

// Mock data for groups
const mockGroups = [
  {
    group_code: 'awskrug',
    group_name: 'AWS 한국 사용자 모임',
    event_count: 24,
    member_count: 1200
  },
  {
    group_code: 'ausg',
    group_name: 'AWSKRUG 대학생 모임',
    event_count: 12,
    member_count: 350
  },
  {
    group_code: 'serverless',
    group_name: 'Serverless Korea',
    event_count: 8,
    member_count: 180
  }
];

// Mock data for recent events
const mockRecentEvents = [
  {
    event_code: 'event1',
    event_name: '2023년 7월 정기 모임',
    group_code: 'awskrug',
    group_name: 'AWS 한국 사용자 모임',
    event_date_time: '2023-07-15T18:00:00',
    registrations: 85,
    checkins: 72
  },
  {
    event_code: 'event2',
    event_name: '대학생을 위한 AWS 입문',
    group_code: 'ausg',
    group_name: 'AWSKRUG 대학생 모임',
    event_date_time: '2023-07-10T14:00:00',
    registrations: 45,
    checkins: 38
  },
  {
    event_code: 'event3',
    event_name: 'Serverless 아키텍처 워크샵',
    group_code: 'serverless',
    group_name: 'Serverless Korea',
    event_date_time: '2023-07-05T19:00:00',
    registrations: 60,
    checkins: 52
  }
];

// Mock data for upcoming events
const mockUpcomingEvents = [
  {
    event_code: 'event4',
    event_name: '2023년 8월 정기 모임',
    group_code: 'awskrug',
    group_name: 'AWS 한국 사용자 모임',
    event_date_time: '2023-08-15T18:00:00',
    registrations: 65
  },
  {
    event_code: 'event5',
    event_name: 'AWS 보안 서비스 심화',
    group_code: 'awskrug',
    group_name: 'AWS 한국 사용자 모임',
    event_date_time: '2023-08-05T14:00:00',
    registrations: 42
  }
];

const Dashboard = () => {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [groups, setGroups] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    const fetchData = async () => {
      try {
        // In a real app, these would be API calls
        setTimeout(() => {
          setGroups(mockGroups);
          setRecentEvents(mockRecentEvents);
          setUpcomingEvents(mockUpcomingEvents);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGroupChange = (event) => {
    const groupCode = event.target.value;
    setSelectedGroup(groupCode);
    
    // In a real app, you would fetch new data based on the selected group
    if (groupCode === 'all') {
      setRecentEvents(mockRecentEvents);
      setUpcomingEvents(mockUpcomingEvents);
    } else {
      setRecentEvents(mockRecentEvents.filter(event => event.group_code === groupCode));
      setUpcomingEvents(mockUpcomingEvents.filter(event => event.group_code === groupCode));
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>로딩 중...</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          대시보드
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>소모임 필터</InputLabel>
          <Select
            value={selectedGroup}
            label="소모임 필터"
            onChange={handleGroupChange}
            size="small"
          >
            <MenuItem value="all">모든 소모임</MenuItem>
            {groups.map((group) => (
              <MenuItem key={group.group_code} value={group.group_code}>
                {group.group_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              소모임
            </Typography>
            <Typography component="p" variant="h4">
              {groups.length}
            </Typography>
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                component={Link} 
                to="/groups"
                endIcon={<GroupsIcon />}
              >
                소모임 관리
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              총 이벤트
            </Typography>
            <Typography component="p" variant="h4">
              {groups.reduce((sum, group) => sum + group.event_count, 0)}
            </Typography>
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                component={Link} 
                to="/events"
                endIcon={<EventIcon />}
              >
                이벤트 관리
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              총 회원
            </Typography>
            <Typography component="p" variant="h4">
              {groups.reduce((sum, group) => sum + group.member_count, 0)}
            </Typography>
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                component={Link} 
                to="/upload"
                endIcon={<PeopleIcon />}
              >
                회원 등록
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              평균 참석률
            </Typography>
            <Typography component="p" variant="h4">
              {Math.round(recentEvents.reduce((sum, event) => sum + (event.checkins / event.registrations * 100), 0) / (recentEvents.length || 1))}%
            </Typography>
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                component={Link} 
                to="/stats"
                endIcon={<BarChartIcon />}
              >
                통계 보기
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Groups Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h2">
            소모임
          </Typography>
          <Button 
            variant="contained" 
            size="small" 
            component={Link} 
            to="/groups/new"
            startIcon={<AddIcon />}
          >
            소모임 등록
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.group_code}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {group.group_name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip 
                      icon={<EventIcon />} 
                      label={`이벤트 ${group.event_count}개`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      icon={<PeopleIcon />} 
                      label={`회원 ${group.member_count}명`} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/groups/${group.group_code}`}
                  >
                    상세 보기
                  </Button>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/groups/${group.group_code}/stats`}
                  >
                    통계
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recent Events Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h2">
            최근 이벤트
          </Typography>
          <Button 
            variant="contained" 
            size="small" 
            component={Link} 
            to="/events/new"
            startIcon={<AddIcon />}
          >
            이벤트 등록
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {recentEvents.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography>최근 이벤트가 없습니다.</Typography>
              </Paper>
            </Grid>
          ) : (
            recentEvents.map((event) => (
              <Grid item xs={12} md={6} key={event.event_code}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {event.event_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {event.group_name} | {new Date(event.event_date_time).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={`등록: ${event.registrations}명`} 
                        size="small" 
                        color="primary" 
                      />
                      <Chip 
                        label={`참석: ${event.checkins}명`} 
                        size="small" 
                        color="success" 
                      />
                      <Chip 
                        label={`참석률: ${Math.round(event.checkins / event.registrations * 100)}%`} 
                        size="small" 
                        color="secondary" 
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={Link} 
                      to={`/events/${event.event_code}`}
                    >
                      상세 보기
                    </Button>
                    <Button 
                      size="small" 
                      component={Link} 
                      to={`/events/${event.event_code}/stats`}
                    >
                      통계
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Upcoming Events Section */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          예정된 이벤트
        </Typography>
        
        <Paper>
          {upcomingEvents.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography>예정된 이벤트가 없습니다.</Typography>
            </Box>
          ) : (
            <List>
              {upcomingEvents.map((event, index) => (
                <React.Fragment key={event.event_code}>
                  <ListItem
                    secondaryAction={
                      <Button 
                        size="small" 
                        component={Link} 
                        to={`/events/${event.event_code}`}
                      >
                        상세 보기
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={event.event_name}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {event.group_name}
                          </Typography>
                          {` | ${new Date(event.event_date_time).toLocaleString()} | 등록: ${event.registrations}명`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < upcomingEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;