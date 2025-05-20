import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
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
import eventService from '../../services/eventService';
import AlertMessage from '../../components/common/AlertMessage';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GlobalStats = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      setAlert({
        open: true,
        message: '이벤트 정보를 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      // 이 부분은 실제 API가 구현되면 연결해야 함
      // const blob = await statisticsService.exportAllData(format);
      
      // 임시 구현
      const blob = new Blob(['모든 데이터 내보내기'], { type: 'text/plain' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `all-events-export.${format}`;
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

  // 차트 데이터 준비
  const chartData = {
    labels: events.map(event => event.event_name),
    datasets: [
      {
        label: '등록자 수',
        data: events.map(event => Math.floor(Math.random() * 50) + 10), // 실제 데이터로 대체 필요
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: '체크인 수',
        data: events.map(event => Math.floor(Math.random() * 40) + 5), // 실제 데이터로 대체 필요
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          통계 및 보고서
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

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              이벤트 통계 요약
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  총 이벤트 수
                </Typography>
                <Typography variant="h4" color="primary">
                  {events.length}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  총 등록자 수
                </Typography>
                <Typography variant="h4" color="secondary">
                  {/* 실제 데이터로 대체 필요 */}
                  {events.reduce((sum, event) => sum + (Math.floor(Math.random() * 50) + 10), 0)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  총 체크인 수
                </Typography>
                <Typography variant="h4" color="info.main">
                  {/* 실제 데이터로 대체 필요 */}
                  {events.reduce((sum, event) => sum + (Math.floor(Math.random() * 40) + 5), 0)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              이벤트별 등록자 및 체크인 현황
            </Typography>
            <Box sx={{ height: 400 }}>
              <Bar 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: '이벤트별 참가 현황'
                    },
                  },
                }}
              />
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

export default GlobalStats;