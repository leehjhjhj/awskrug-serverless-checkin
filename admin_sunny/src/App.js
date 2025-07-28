import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Common components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';

// Pages
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import GlobalStats from './pages/stats/GlobalStats';
import ExcelUpload from './pages/upload/ExcelUpload';
import EventList from './pages/events/EventList';
import EventForm from './pages/events/EventForm';
import EventDetail from './pages/events/EventDetail';
import EventRegistrations from './pages/events/EventRegistrations';
import EventCheckins from './pages/events/EventCheckins';
import RegistrationList from './pages/registrations/RegistrationList';
import CheckinList from './pages/checkins/CheckinList';
import EventStats from './pages/stats/EventStats';

// Group Pages - 소모임 관련 페이지
import GroupList from './pages/groups/GroupList';
import GroupForm from './pages/groups/GroupForm';
import GroupDetail from './pages/groups/GroupDetail';
import GroupStats from './pages/groups/GroupStats';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Layout component for authenticated pages
const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header handleDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - 240px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* 소모임(그룹) 관련 라우트 */}
            <Route path="/groups" element={
              <ProtectedRoute>
                <Layout>
                  <GroupList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/groups/new" element={
              <ProtectedRoute>
                <Layout>
                  <GroupForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/groups/:groupCode" element={
              <ProtectedRoute>
                <Layout>
                  <GroupDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/groups/:groupCode/edit" element={
              <ProtectedRoute>
                <Layout>
                  <GroupForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* 그룹 통계 라우트 임시 비활성화 */}
            {/* <Route path="/groups/:groupCode/stats" element={
              <ProtectedRoute>
                <Layout>
                  <GroupStats />
                </Layout>
              </ProtectedRoute>
            } /> */}
            
            {/* 이벤트 관련 라우트 */}
            <Route path="/events" element={
              <ProtectedRoute>
                <Layout>
                  <EventList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events/new" element={
              <ProtectedRoute>
                <Layout>
                  <EventForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events/:eventCode" element={
              <ProtectedRoute>
                <Layout>
                  <EventDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events/:eventCode/edit" element={
              <ProtectedRoute>
                <Layout>
                  <EventForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events/:eventCode/registrations" element={
              <ProtectedRoute>
                <Layout>
                  <EventRegistrations />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events/:eventCode/checkins" element={
              <ProtectedRoute>
                <Layout>
                  <EventCheckins />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events/:eventCode/stats" element={
              <ProtectedRoute>
                <Layout>
                  <EventStats />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* 글로벌 통계 라우트 임시 비활성화 */}
            {/* <Route path="/stats" element={
              <ProtectedRoute>
                <Layout>
                  <GlobalStats />
                </Layout>
              </ProtectedRoute>
            } /> */}
            
            <Route path="/upload" element={
              <ProtectedRoute>
                <Layout>
                  <ExcelUpload />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </AuthProvider>
  );
}

export default App;