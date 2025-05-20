import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Divider,
  Box,
  Collapse,
  ListItemButton
} from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import eventService from '../../services/eventService';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventCode } = useParams();
  const [events, setEvents] = useState([]);
  const [openEvents, setOpenEvents] = useState(false);
  const [openEventSubMenus, setOpenEventSubMenus] = useState({});
  
  useEffect(() => {
    // 이벤트 목록 가져오기
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    
    fetchEvents();
  }, []);
  
  // 현재 경로에 이벤트 코드가 포함되어 있으면 이벤트 메뉴를 자동으로 열기
  useEffect(() => {
    if (location.pathname.includes('/events/') && !location.pathname.includes('/events/new')) {
      setOpenEvents(true);
      
      // 현재 경로에 포함된 이벤트 코드 찾기
      const pathParts = location.pathname.split('/');
      const index = pathParts.findIndex(part => part === 'events');
      if (index !== -1 && index + 1 < pathParts.length) {
        const currentEventCode = pathParts[index + 1];
        // 해당 이벤트의 서브메뉴 열기
        setOpenEventSubMenus(prev => ({
          ...prev,
          [currentEventCode]: true
        }));
      }
    }
  }, [location.pathname]);

  const handleEventsClick = () => {
    setOpenEvents(!openEvents);
  };
  
  const handleEventSubMenuClick = (eventCode) => {
    setOpenEventSubMenus(prev => ({
      ...prev,
      [eventCode]: !prev[eventCode]
    }));
  };

  const mainMenuItems = [
    { text: '대시보드', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '이벤트 관리', icon: <EventIcon />, path: '/events' },
    { text: '통계 및 보고서', icon: <BarChartIcon />, path: '/stats' },
    { text: 'Excel 업로드', icon: <UploadFileIcon />, path: '/upload' }
  ];
  
  const eventSubMenuItems = [
    { text: '새 이벤트 생성', icon: <AddIcon />, path: '/events/new' }
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {mainMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              if (item.path === '/events') {
                handleEventsClick();
              } else {
                navigate(item.path);
              }
            }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
            {item.path === '/events' && (openEvents ? <ExpandLess /> : <ExpandMore />)}
          </ListItem>
        ))}
        
        <Collapse in={openEvents} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {eventSubMenuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            
            {events.map((event) => (
              <React.Fragment key={event.event_code}>
                <ListItemButton
                  selected={location.pathname === `/events/${event.event_code}`}
                  onClick={() => {
                    handleEventSubMenuClick(event.event_code);
                    navigate(`/events/${event.event_code}`);
                  }}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText primary={event.event_name} />
                  {openEventSubMenus[event.event_code] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                
                <Collapse in={openEventSubMenus[event.event_code] || false} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      selected={location.pathname === `/events/${event.event_code}/registrations`}
                      onClick={() => navigate(`/events/${event.event_code}/registrations`)}
                      sx={{ pl: 6 }}
                    >
                      <ListItemIcon>
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText primary="등록자 관리" />
                    </ListItemButton>
                    
                    <ListItemButton
                      selected={location.pathname === `/events/${event.event_code}/checkins`}
                      onClick={() => navigate(`/events/${event.event_code}/checkins`)}
                      sx={{ pl: 6 }}
                    >
                      <ListItemIcon>
                        <CheckCircleIcon />
                      </ListItemIcon>
                      <ListItemText primary="체크인 관리" />
                    </ListItemButton>
                    
                    <ListItemButton
                      selected={location.pathname === `/events/${event.event_code}/stats`}
                      onClick={() => navigate(`/events/${event.event_code}/stats`)}
                      sx={{ pl: 6 }}
                    >
                      <ListItemIcon>
                        <BarChartIcon />
                      </ListItemIcon>
                      <ListItemText primary="통계" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;