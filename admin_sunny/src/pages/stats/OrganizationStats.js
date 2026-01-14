import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, CircularProgress, Button, Divider, Tabs, Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PercentIcon from '@mui/icons-material/Percent';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import statisticsService from '../../services/statisticsService';
import organizationService from '../../services/organizationService';
import AlertMessage from '../../components/common/AlertMessage';
import VersionStatsTabContent from '../../components/stats/VersionStatsTabContent';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrganizationStats = () => {
  const { organizationCode } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [tabValue, setTabValue] = useState(0);
  const [eventVersions, setEventVersions] = useState([]);
  const [versionStats, setVersionStats] = useState({});
  const [versionStatsLoading, setVersionStatsLoading] = useState({});

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      if (!organizationCode || cancelled) return;

      try {
        setLoading(true);
        const data = await statisticsService.getOrganizationStats(organizationCode);

        if (!cancelled) {
          setStats(data);
        }

        // Fetch organization details to get event_version array
        try {
          const orgData = await organizationService.getOrganization(organizationCode);
          if (!cancelled && orgData.event_version && Array.isArray(orgData.event_version)) {
            setEventVersions(orgData.event_version);
          }
        } catch (orgError) {
          console.error('Failed to fetch organization details:', orgError);
          // Continue with empty event_versions if this fails
          if (!cancelled) {
            setEventVersions([]);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch organization stats:', error);
          setAlert({
            open: true,
            message: '조직 통계를 불러오는데 실패했습니다.',
            severity: 'error'
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [organizationCode]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchVersionStats = async (eventVersion) => {
    if (versionStatsLoading[eventVersion] || versionStats[eventVersion]) {
      return; // 이미 로딩 중이거나 캐시됨
    }

    try {
      setVersionStatsLoading(prev => ({ ...prev, [eventVersion]: true }));
      const data = await statisticsService.getEventVersionStats(eventVersion);
      setVersionStats(prev => ({ ...prev, [eventVersion]: data }));
    } catch (error) {
      console.error(`Failed to fetch stats for version ${eventVersion}:`, error);
      setAlert({
        open: true,
        message: `버전 ${eventVersion} 통계를 불러오는데 실패했습니다.`,
        severity: 'error'
      });
    } finally {
      setVersionStatsLoading(prev => ({ ...prev, [eventVersion]: false }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          통계를 불러올 수 없습니다.
        </Typography>
      </Box>
    );
  }

  const averageRetentionPercentage = Math.round(stats.average_retention_rate * 100);
  const avgRegistrationsPerEvent = stats.total_events > 0
    ? Math.round(stats.total_registrations / stats.total_events)
    : 0;
  const avgCheckinsPerEvent = stats.total_events > 0
    ? Math.round(stats.total_checkins / stats.total_events)
    : 0;

  // 통계 비교 차트 데이터
  const statsComparisonData = {
    labels: ['총 이벤트 수', '총 등록자 수', '총 체크인 수'],
    datasets: [
      {
        label: '수량',
        data: [stats.total_events, stats.total_registrations, stats.total_checkins],
        backgroundColor: ['#2196f3', '#ff9800', '#4caf50'],
      },
    ],
  };

  // 평균 통계 차트 데이터
  const avgStatsData = {
    labels: ['이벤트당 평균 등록자', '이벤트당 평균 체크인'],
    datasets: [
      {
        label: '평균 인원',
        data: [avgRegistrationsPerEvent, avgCheckinsPerEvent],
        backgroundColor: ['#9c27b0', '#00bcd4'],
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            뒤로
          </Button>
          <Typography variant="h5" component="h1">
            조직 통계 - {stats.organization_code}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="전체 통계" />
          <Tab label="버전별 통계" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Box>
          {/* 주요 통계 카드 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <EventIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              총 이벤트 수
            </Typography>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {stats.total_events}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              주최한 전체 이벤트
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              총 등록자 수
            </Typography>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {stats.total_registrations}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              전체 이벤트 등록자
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              총 체크인 수
            </Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats.total_checkins}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              전체 체크인 횟수
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'white'
          }}>
            <PercentIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
              평균 Retention Rate
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {averageRetentionPercentage}%
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, opacity: 0.8 }}>
              평균 등록 대비 참석률
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 차트 섹션 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              전체 통계
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={statsComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              이벤트당 평균 통계
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={avgStatsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 상세 통계 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          상세 통계
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                이벤트당 평균 등록자 수
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {avgRegistrationsPerEvent}명
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                총 등록자 {stats.total_registrations}명 ÷ 총 이벤트 {stats.total_events}개
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" color="success.main" gutterBottom>
                이벤트당 평균 체크인 수
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {avgCheckinsPerEvent}회
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                총 체크인 {stats.total_checkins}회 ÷ 총 이벤트 {stats.total_events}개
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: 'info.light', borderRadius: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                평균 Retention Rate 계산
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                조직 내 모든 이벤트의 Retention Rate를 평균하여 계산합니다.
              </Typography>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  평균 Retention Rate = {(stats.average_retention_rate * 100).toFixed(2)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  이 값은 각 이벤트의 (실제 참석자 수 ÷ 등록자 수)를 모두 더한 후 이벤트 수로 나눈 평균값입니다.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {stats.total_events === 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.dark">
              이 조직은 아직 주최한 이벤트가 없습니다.
            </Typography>
          </Box>
        )}
      </Paper>
        </Box>
      )}

      {tabValue === 1 && (
        <VersionStatsTabContent
          eventVersions={eventVersions}
          versionStats={versionStats}
          versionStatsLoading={versionStatsLoading}
          onFetchVersionStats={fetchVersionStats}
        />
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

export default OrganizationStats;
