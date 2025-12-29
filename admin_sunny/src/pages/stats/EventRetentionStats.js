import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, CircularProgress, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import statisticsService from '../../services/statisticsService';
import AlertMessage from '../../components/common/AlertMessage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EventRetentionStats = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      if (!eventCode || cancelled) return;

      try {
        setLoading(true);
        const data = await statisticsService.getEventRetention(eventCode);

        if (!cancelled) {
          setStats(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch event retention:', error);
          setAlert({
            open: true,
            message: error.response?.status === 404
              ? '이벤트를 찾을 수 없습니다.'
              : 'Retention 통계를 불러오는데 실패했습니다.',
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
  }, [eventCode]);

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

  const retentionPercentage = Math.round(stats.retention_rate * 100);

  // Retention 차트 데이터 (도넛 차트)
  const retentionChartData = {
    labels: ['실제 참석자', '미참석자'],
    datasets: [
      {
        data: [stats.unique_checkin_count, stats.registration_count - stats.unique_checkin_count],
        backgroundColor: ['#4caf50', '#f44336'],
        hoverBackgroundColor: ['#388e3c', '#d32f2f'],
      },
    ],
  };

  // 체크인 비교 차트 데이터 (막대 차트)
  const checkinComparisonData = {
    labels: ['등록자 수', '전체 체크인 수', '실제 참석자 수'],
    datasets: [
      {
        label: '인원',
        data: [stats.registration_count, stats.checkin_count, stats.unique_checkin_count],
        backgroundColor: ['#2196f3', '#ff9800', '#4caf50'],
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
            이벤트 Retention Rate - {stats.event_code}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 주요 통계 카드 */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              전체 등록자 수
            </Typography>
            <Typography variant="h4" color="primary">
              {stats.registration_count}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              이벤트에 등록한 총 인원
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              전체 체크인 수
            </Typography>
            <Typography variant="h4" color="warning.main">
              {stats.checkin_count}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              중복 포함 전체 체크인 횟수
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              실제 참석자 수
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.unique_checkin_count}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              중복 제거된 실제 참석 인원
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '100%', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
              Retention Rate
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {retentionPercentage}%
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              등록 대비 참석률
            </Typography>
          </Paper>
        </Grid>

        {/* Retention 도넛 차트 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              참석 현황
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <Box sx={{ width: '70%', maxWidth: 300 }}>
                <Doughnut
                  data={retentionChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value}명 (${percentage}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 체크인 비교 막대 차트 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              체크인 비교
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={checkinComparisonData}
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
                      ticks: {
                        stepSize: 10
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* 상세 설명 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              통계 설명
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  등록자 수 (Registration Count)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  이벤트에 사전 등록한 총 인원입니다. ({stats.registration_count}명)
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  전체 체크인 수 (Checkin Count)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  중복을 포함한 전체 체크인 횟수입니다. 한 사람이 여러 번 체크인할 수 있습니다. ({stats.checkin_count}회)
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  실제 참석자 수 (Unique Checkin Count)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  중복을 제거한 실제 참석 인원입니다. ({stats.unique_checkin_count}명)
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.contrastText">
                <strong>Retention Rate 계산식:</strong> 실제 참석자 수 ÷ 등록자 수 = {stats.unique_checkin_count} ÷ {stats.registration_count} = {(stats.retention_rate * 100).toFixed(2)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <AlertMessage
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        severity={alert.severity}
        message={alert.message}
      />
    </Box>
  );
};

export default EventRetentionStats;
