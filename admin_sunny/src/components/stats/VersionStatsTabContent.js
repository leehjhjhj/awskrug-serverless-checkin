import React from 'react';
import {
  Box, Typography, Paper, Grid, Skeleton
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PercentIcon from '@mui/icons-material/Percent';

const VersionStatsCard = ({ version, stats, loading }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="75%" />
      </Paper>
    );
  }

  if (!stats) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {version}
        </Typography>
        <Typography variant="body2" color="error">
          통계 로드 실패
        </Typography>
      </Paper>
    );
  }

  const retentionPercentage = Math.round(stats.average_retention_rate * 100);

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
        {version}
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EventIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              총 이벤트
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {stats.total_events}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ fontSize: 20, color: 'warning.main', mr: 1 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              총 등록자
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {stats.total_registrations}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              체크인 / 고유 체크인
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {stats.total_checkins} / {stats.unique_checkins}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PercentIcon sx={{ fontSize: 20, color: 'info.main', mr: 1 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Retention Rate
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="info.main">
              {retentionPercentage}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const VersionStatsTabContent = ({
  eventVersions,
  versionStats,
  versionStatsLoading,
  onFetchVersionStats
}) => {
  React.useEffect(() => {
    // Fetch stats for all versions when component mounts
    if (eventVersions && eventVersions.length > 0) {
      eventVersions.forEach(version => {
        if (!versionStats[version] && !versionStatsLoading[version]) {
          onFetchVersionStats(version);
        }
      });
    }
  }, [eventVersions, versionStats, versionStatsLoading, onFetchVersionStats]);

  if (!eventVersions || eventVersions.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          등록된 이벤트 버전이 없습니다.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        버전별 통계 - {eventVersions.length}개 버전
      </Typography>

      <Grid container spacing={3}>
        {eventVersions.map(version => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={version}>
            <VersionStatsCard
              version={version}
              stats={versionStats[version]}
              loading={versionStatsLoading[version]}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VersionStatsTabContent;
