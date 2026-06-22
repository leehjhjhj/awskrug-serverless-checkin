import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InputAdornment from '@mui/material/InputAdornment';
import registrationService from '../../services/registrationService';
import checkinService from '../../services/checkinService';

const EventRegistrations = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  
  const [registrations, setRegistrations] = useState([]);
  // Phones (hashed) that are already checked in for THIS event.
  // Source of truth is GET /checkin/{event_code}, NOT attendance_count
  // (attendance_count is a cross-event cumulative count, not a per-event flag).
  const [checkedInPhones, setCheckedInPhones] = useState(new Set());
  // Phones with an in-flight check-in request (to disable the button and block double-clicks).
  const [checkingInPhones, setCheckingInPhones] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    
    const loadRegistrations = async () => {
      if (cancelled) return;
      
      try {
        setLoading(true);
        console.log('Fetching registrations for event:', eventCode);
        const [data, checkins] = await Promise.all([
          registrationService.getRegistrations(eventCode),
          // Best-effort: a failed checkin fetch shouldn't block the registration list.
          checkinService.getCheckins(eventCode).catch((e) => {
            console.error('Failed to fetch checkins:', e);
            return [];
          })
        ]);

        if (!cancelled) {
          console.log('Registration data received:', data);
          setRegistrations(data.map(registration => ({
            ...registration,
            id: registration.phone
          })));
          setCheckedInPhones(new Set((checkins || []).map(c => c.phone)));
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch registrations:', error);
          setSnackbar({
            open: true,
            message: '등록자 목록을 불러오는데 실패했습니다.',
            severity: 'error'
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, [eventCode]);

  const refetchRegistrations = async () => {
    try {
      setLoading(true);
      const [data, checkins] = await Promise.all([
        registrationService.getRegistrations(eventCode),
        checkinService.getCheckins(eventCode).catch((e) => {
          console.error('Failed to fetch checkins:', e);
          return null;
        })
      ]);
      setRegistrations(data.map(registration => ({
        ...registration,
        id: registration.phone
      })));
      if (checkins) {
        setCheckedInPhones(new Set(checkins.map(c => c.phone)));
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      setSnackbar({
        open: true,
        message: '등록자 목록을 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const refetchCheckins = async () => {
    try {
      const checkins = await checkinService.getCheckins(eventCode);
      setCheckedInPhones(new Set((checkins || []).map(c => c.phone)));
    } catch (error) {
      console.error('Failed to fetch checkins:', error);
    }
  };

  const handleOpenDialog = (registration = null) => {
    setEditingRegistration(registration);
    setFormData({
      name: registration?.name || '',
      phone: registration?.phone || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRegistration(null);
    setFormData({
      name: '',
      phone: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingRegistration) {
        await registrationService.updateRegistration(
          eventCode,
          editingRegistration.phone,
          formData
        );
        setSnackbar({
          open: true,
          message: '등록자 정보가 수정되었습니다.',
          severity: 'success'
        });
      } else {
        await registrationService.addRegistration(eventCode, formData);
        setSnackbar({
          open: true,
          message: '등록자가 추가되었습니다.',
          severity: 'success'
        });
      }
      handleCloseDialog();
      refetchRegistrations();
    } catch (error) {
      console.error('Failed to save registration:', error);
      setSnackbar({
        open: true,
        message: '등록자 저장에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (phone) => {
    if (window.confirm('이 등록자를 삭제하시겠습니까?')) {
      try {
        await registrationService.deleteRegistration(eventCode, phone);
        setSnackbar({
          open: true,
          message: '등록자가 삭제되었습니다.',
          severity: 'success'
        });
        refetchRegistrations();
      } catch (error) {
        console.error('Failed to delete registration:', error);
        setSnackbar({
          open: true,
          message: '등록자 삭제에 실패했습니다.',
          severity: 'error'
        });
      }
    }
  };

  const handleCheckin = async (registration) => {
    const phone = registration.phone;
    // Block double-clicks while a request is in flight.
    if (checkingInPhones.has(phone) || checkedInPhones.has(phone)) {
      return;
    }
    setCheckingInPhones(prev => new Set(prev).add(phone));

    try {
      await checkinService.createCheckinFromRegistration(eventCode, phone);
      setCheckedInPhones(prev => new Set(prev).add(phone));
      setSnackbar({
        open: true,
        message: `${registration.name || '등록자'}님이 체크인되었습니다.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to check in registration:', error);
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      if (status === 409) {
        // Already checked in — mark as such and resync from the server.
        setCheckedInPhones(prev => new Set(prev).add(phone));
        setSnackbar({
          open: true,
          message: '이미 체크인되었습니다.',
          severity: 'info'
        });
        refetchCheckins();
      } else if (status === 404) {
        setSnackbar({
          open: true,
          message: detail || '등록자를 찾을 수 없습니다.',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: '체크인에 실패했습니다.',
          severity: 'error'
        });
      }
    } finally {
      setCheckingInPhones(prev => {
        const next = new Set(prev);
        next.delete(phone);
        return next;
      });
    }
  };

  const columns = [
    { field: 'phone', headerName: '전화번호', width: 150 },
    { field: 'name', headerName: '이름', width: 200 },
    {
      field: 'attendance_count',
      headerName: '참석 횟수',
      width: 120,
      type: 'number'
    },
    {
      field: 'checkin',
      headerName: '체크인',
      width: 140,
      sortable: false,
      renderCell: (params) => {
        const phone = params.row.phone;
        if (checkedInPhones.has(phone)) {
          return (
            <Chip
              icon={<CheckCircleIcon />}
              label="체크인됨"
              color="success"
              size="small"
              variant="outlined"
            />
          );
        }
        const isCheckingIn = checkingInPhones.has(phone);
        return (
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={
              isCheckingIn
                ? <CircularProgress size={16} color="inherit" />
                : <HowToRegIcon />
            }
            disabled={isCheckingIn}
            onClick={() => handleCheckin(params.row)}
          >
            체크인
          </Button>
        );
      },
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="수정">
            <IconButton
              onClick={() => handleOpenDialog(params.row)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton
              onClick={() => handleDelete(params.row.phone)}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const filteredRegistrations = registrations.filter(registration =>
    registration.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={() => navigate(`/events/${eventCode}`)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            등록자 관리 - {eventCode}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          등록자 추가
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          placeholder="이름으로 검색"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredRegistrations}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          disableSelectionOnClick
          getRowId={(row) => row.phone}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRegistration ? '등록자 수정' : '등록자 추가'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="이름"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="전화번호"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={editingRegistration !== null}
            helperText={editingRegistration ? "수정 시 전화번호는 변경할 수 없습니다." : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRegistration ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventRegistrations;