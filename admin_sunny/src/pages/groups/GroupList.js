import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Button, Box, 
  Grid, Card, CardContent, CardActions, Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';

// Mock data for groups
const mockGroups = [
  {
    group_code: 'awskrug',
    group_name: 'AWS 한국 사용자 모임',
    description: 'AWS 클라우드 기술을 공유하는 한국 사용자 모임',
    created_at: '2020-01-01',
    logo_url: 'https://via.placeholder.com/150',
    event_count: 24,
    member_count: 1200
  },
  {
    group_code: 'ausg',
    group_name: 'AWSKRUG 대학생 모임',
    description: '대학생을 위한 AWS 클라우드 기술 학습 모임',
    created_at: '2021-03-15',
    logo_url: 'https://via.placeholder.com/150',
    event_count: 12,
    member_count: 350
  },
  {
    group_code: 'serverless',
    group_name: 'Serverless Korea',
    description: '서버리스 아키텍처와 기술을 공유하는 모임',
    created_at: '2022-05-20',
    logo_url: 'https://via.placeholder.com/150',
    event_count: 8,
    member_count: 180
  }
];

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchGroups = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setGroups(mockGroups);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return <Box sx={{ p: 3 }}>로딩 중...</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          소모임 목록
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={Link}
          to="/groups/new"
        >
          소모임 등록
        </Button>
      </Box>

      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} md={4} key={group.group_code}>
            <Card>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={group.logo_url} 
                  alt={group.group_name} 
                  style={{ height: 100, objectFit: 'contain' }}
                />
              </Box>
              <CardContent>
                <Typography variant="h5" component="div">
                  {group.group_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {group.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
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
                  to={`/groups/${group.group_code}/edit`}
                >
                  수정
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
    </Container>
  );
};

export default GroupList;