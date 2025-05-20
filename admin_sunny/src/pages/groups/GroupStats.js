import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Chart components (using recharts)
// In a real app, you would need to install recharts: npm install recharts
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data
const mockGroup = {
  group_code: 'awskrug',
  group_name: 'AWS 한국 사용자 모임',
  description: 'AWS 클라우드 기술을 공유하는 한국 사용자 모임'
};

const mockAttendanceData = [
  { name: '1월', 등록: 85, 참석: 72, 참석률: 84.7 },
  { name: '2월', 등록: 92, 참석: 78, 참석률: 84.8 },
  { name: '3월', 등록: 105, 참석: 89, 참석률: 84.8 },
  { name: '4월', 등록: 110, 참석: 95, 참석률: 86.4 },
  { name: '5월', 등록: 98, 참석: 82, 참석률: 83.7 },
  { name: '6월', 등록: 115, 참석: 102, 참석률: 88.7 }
];

const mockComparisonData = [
  { name: 'AWSKRUG', 참석률: 85.5 },
  { name: 'AUSG', 참석률: 78.2 },
  { name: 'Serverless', 참석률: 82.1 }
];

const mockTimeDistribution = [
  { name: '정시 참석', value: 75 },
  { name: '10분 이내 지각', value: 15 },
  { name: '30분 이내 지각', value: 7 },
  { name: '30분 이상 지각', value: 3 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const GroupStats = () => {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API calls
    const fetchData = async () => {
      try {
        // In a real app, these would be API calls
        setTimeout(() => {
          setGroup(mockGroup);
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

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
    // In a real app, you would fetch new data based on the selected time range
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/groups/${groupCode}`)}
            sx={{ mr: 2 }}
          >
            돌아가기
          </Button>
          <Typography variant="h5" component="h1">
            {group.group_name} 통계
          </Typography>
        </Box>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>기간</InputLabel>
          <Select
            value={timeRange}
            label="기간"
            onChange={handleTimeRangeChange}
            size="small"
          >
            <MenuItem value="3months">최근 3개월</MenuItem>
            <MenuItem value="6months">최근 6개월</MenuItem>
            <MenuItem value="1year">최근 1년</MenuItem>
            <MenuItem value="all">전체 기간</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>평균 참석률</Typography>
              <Typography variant="h3" color="primary">85.5%</Typography>
              <Typography variant="body2" color="text.secondary">
                전체 등록 대비 참석 비율
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>평균 참석자 수</Typography>
              <Typography variant="h3" color="secondary">86명</Typography>
              <Typography variant="body2" color="text.secondary">
                이벤트당 평균 참석자 수
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>정시 참석률</Typography>
              <Typography variant="h3" color="success.main">75%</Typography>
              <Typography variant="body2" color="text.secondary">
                정시에 참석한 비율
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Attendance Trend Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>참석 추이</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={mockAttendanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="등록" stroke="#8884d8" />
                <Line yAxisId="left" type="monotone" dataKey="참석" stroke="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="참석률" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Group Comparison Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>소모임별 참석률 비교</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={mockComparisonData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="참석률" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Time Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>참석 시간 분포</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockTimeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockTimeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GroupStats;