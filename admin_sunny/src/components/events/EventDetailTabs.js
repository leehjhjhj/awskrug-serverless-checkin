import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Tabs, Tab } from '@mui/material';

// 이벤트 상세/등록자/체크인/통계 사이를 탭으로 이동하는 공통 탭바.
// 각 페이지 상단에 두어, 어느 화면에서든 탭으로 바로 전환할 수 있게 한다.
const TAB_PATHS = ['', '/registrations', '/checkins', '/stats'];

const EventDetailTabs = ({ eventCode, current }) => {
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    if (newValue === current) return;
    navigate(`/events/${eventCode}${TAB_PATHS[newValue]}`);
  };

  return (
    <Paper sx={{ mb: 3 }}>
      <Tabs value={current} onChange={handleChange} variant="fullWidth">
        <Tab label="상세 정보" />
        <Tab label="등록자 관리" />
        <Tab label="체크인 관리" />
        <Tab label="통계" />
      </Tabs>
    </Paper>
  );
};

export default EventDetailTabs;
