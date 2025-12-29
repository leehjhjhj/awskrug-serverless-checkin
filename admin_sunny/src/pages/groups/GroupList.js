import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Box,
  Grid, Card, CardContent, CardActions, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import organizationService from '../../services/organizationService';

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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    
    const fetchGroups = async () => {
      if (cancelled) return;
      
      try {
        setLoading(true);
        const organizationsData = await organizationService.getAllOrganizations();
        
        if (!cancelled) {
          // Transform API response to match component structure
          const transformedGroups = organizationsData.map(org => ({
            group_code: org.organization_code,
            group_name: org.organization_name,
            description: org.organization_name, // Use name as description since API doesn't provide description
            created_at: new Date().toISOString(), // Default created date
            logo_url: org.full_logo_url || 'https://via.placeholder.com/150', // Use full_logo_url or fallback to placeholder
            event_count: org.event_version ? org.event_version.length : 0, // Count available event versions
            member_count: 0 // Default member count
          }));
          setGroups(transformedGroups);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching organizations:', error);
          // Fallback to mock data
          setGroups(mockGroups);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchGroups();
    
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <Box sx={{ p: 3 }}>로딩 중...</Box>;
  }

  // Filter groups based on search query
  const filteredGroups = groups.filter(group =>
    group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.group_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          소모임 목록
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="소모임 이름, 코드, 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredGroups.map((group) => (
          <Grid item xs={12} md={4} key={group.group_code}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <img
                  src={group.logo_url}
                  alt={group.group_name}
                  style={{ height: 100, objectFit: 'contain' }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div">
                  {group.group_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.description}
                </Typography>
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
                  to={`/statistics/organization/${group.group_code}`}
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