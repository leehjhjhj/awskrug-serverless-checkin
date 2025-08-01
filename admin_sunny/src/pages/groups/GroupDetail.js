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
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import organizationService from '../../services/organizationService';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      if (cancelled) return;
      
      try {
        setLoading(true);
        const orgData = await organizationService.getOrganization(groupCode);
        
        if (!cancelled) {
          // Transform API response to match component structure
          const transformedGroup = {
            group_code: orgData.organization_code,
            group_name: orgData.organization_name,
            description: orgData.organization_name, // Use name as description
            created_at: new Date().toISOString(), // Default created date
            logo_url: orgData.full_logo_url || 'https://via.placeholder.com/150', // Use full_logo_url or fallback to placeholder
            event_count: orgData.event_version ? orgData.event_version.length : 0,
            member_count: 0 // Default member count
          };
          setGroup(transformedGroup);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching organization data:', error);
          // Fallback to mock data
          setGroup(mockGroup);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [groupCode]);


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
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              조직 정보
            </Typography>
            <Typography variant="body1" color="text.secondary">
              현재 조직의 기본 정보가 표시됩니다. 자세한 내용은 수정 페이지에서 확인하실 수 있습니다.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GroupDetail;