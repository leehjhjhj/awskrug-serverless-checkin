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
import statisticsService from '../../services/statisticsService';
import AlertMessage from '../../components/common/AlertMessage';
import EventDetailTabs from '../../components/events/EventDetailTabs';

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
  const [retentionStats, setRetentionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      if (!eventCode || cancelled) return;

      try {
        setLoading(true);

        // 두 API를 독립적으로 호출 (하나가 실패해도 다른 것은 성공할 수 있도록)
        const [statsResult, retentionResult] = await Promise.allSettled([
          eventService.getEventStats(eventCode),
          statisticsService.getEventRetention(eventCode)
        ]);

        if (!cancelled) {
          // Retention API 결과 처리
          if (retentionResult.status === 'fulfilled') {
            setRetentionStats(retentionResult.value);

            // Stats API가 실패했지만 retention 데이터가 있으면 retention 데이터로 기본 stats 구성
            if (statsResult.status === 'rejected') {
              const retData = retentionResult.value;
              setStats({
                event_name: retData.event_code,
                event_date_time: new Date().toISOString(),
                total_registrations: retData.registration_count,
                total_checkins: retData.unique_checkin_count,
                attendance_rate: Math.round(retData.retention_rate * 100)
              });
              console.log('Using retention data for basic stats');
            }
          } else {
            console.error('Failed to fetch retention stats:', retentionResult.reason);
          }

          // Stats API 결과 처리 (성공한 경우에만)
          if (statsResult.status === 'fulfilled') {
            setStats(statsResult.value);
          } else {
            console.error('Failed to fetch event stats:', statsResult.reason);
          }

          // 둘 다 실패한 경우에만 에러 메시지 표시
          if (statsResult.status === 'rejected' && retentionResult.status === 'rejected') {
            setAlert({
              open: true,
              message: '통계 정보를 불러오는데 실패했습니다.',
              severity: 'error'
            });
          } else if (retentionResult.status === 'rejected') {
            setAlert({
              open: true,
              message: 'Retention 통계를 불러오는데 실패했습니다. 기본 통계만 표시됩니다.',
              severity: 'warning'
            });
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Unexpected error:', error);
          setAlert({
            open: true,
            message: '통계 정보를 불러오는데 실패했습니다.',
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

  const handleExcelDownload = async () => {
    try {
      setExportLoading(true);
      const blob = await statisticsService.downloadEventStatistics(eventCode);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `event_statistics_${eventCode}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      setAlert({
        open: true,
        message: '통계 엑셀 파일이 다운로드되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      setAlert({
        open: true,
        message: '엑셀 다운로드에 실패했습니다.',
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
      <EventDetailTabs eventCode={eventCode} current={3} />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          이벤트 통계 - {eventCode}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExcelDownload}
          disabled={exportLoading}
        >
          엑셀 통계 다운로드
        </Button>
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

      {/* Retention Rate 섹션 */}
      {retentionStats && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Retention Rate 분석
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  전체 등록자 수
                </Typography>
                <Typography variant="h4" color="primary">
                  {retentionStats.registration_count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  이벤트에 등록한 총 인원
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  전체 체크인 수
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {retentionStats.checkin_count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  중복 포함 전체 체크인 횟수
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  실제 참석자 수
                </Typography>
                <Typography variant="h4" color="success.main">
                  {retentionStats.unique_checkin_count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  중복 제거된 실제 참석 인원
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, height: '100%', bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
                  Retention Rate
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {Math.round(retentionStats.retention_rate * 100)}%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  등록 대비 참석률
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Retention Rate 설명
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      등록자 수 (Registration Count)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      이벤트에 사전 등록한 총 인원입니다. ({retentionStats.registration_count}명)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      전체 체크인 수 (Checkin Count)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      중복을 포함한 전체 체크인 횟수입니다. ({retentionStats.checkin_count}회)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      실제 참석자 수 (Unique Checkin Count)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      중복을 제거한 실제 참석 인원입니다. ({retentionStats.unique_checkin_count}명)
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.contrastText">
                    <strong>Retention Rate 계산식:</strong> 실제 참석자 수 ÷ 등록자 수 = {retentionStats.unique_checkin_count} ÷ {retentionStats.registration_count} = {(retentionStats.retention_rate * 100).toFixed(2)}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
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