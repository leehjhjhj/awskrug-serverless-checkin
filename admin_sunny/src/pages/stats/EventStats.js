import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Bar, Doughnut } from 'react-chartjs-2';
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
import eventService from '../../services/eventService';
import AlertMessage from '../../components/common/AlertMessage';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EventStats = () => {
  const { eventCode } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (eventCode) {
      fetchStats();
    }
  }, [eventCode]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventStats(eventCode);
      setStats(data);
    } catch (error) {
      setAlert({
        open: true,
        message: '통계 정보를 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      const blob = await eventService.exportEventData(eventCode, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `event-${eventCode}-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setAlert({
        open: true,
        message: '데이터가 성공적으로 내보내졌습니다.',
        severity: 'success'
      });
    } catch (error) {
      setAlert({
        open: true,
        message: '데이터 내보내기에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare chart data
  const attendanceData = {
    labels: ['참석', '미참석'],
    datasets: [
      {
        data: stats ? [stats.total_checkins, stats.total_registrations - stats.total_checkins] : [0, 0],
        backgroundColor: ['#4caf50', '#f44336'],
        hoverBackgroundColor: ['#388e3c', '#d32f2f'],
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          이벤트 통계 - {eventCode}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
            disabled={exportLoading}
            sx={{ mr: 1 }}
          >
            CSV 내보내기
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('excel')}
            disabled={exportLoading}
          >
            Excel 내보내기
          </Button>
        </Box>
      </Box>

      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                주요 통계
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    이벤트 이름
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {stats.event_name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    이벤트 일시
                  </Typography>
                  <Typography variant="body1">
                    {new Date(stats.event_date_time).toLocaleString('ko-KR')}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    총 등록자 수
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.total_registrations}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    총 체크인 수
                  </Typography>
                  <Typography variant="h4" color="secondary">
                    {stats.total_checkins}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    출석률
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats.attendance_rate}%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                출석 현황
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ width: '70%', maxWidth: 300 }}>
                  <Doughnut 
                    data={attendanceData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
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

export default EventStats;