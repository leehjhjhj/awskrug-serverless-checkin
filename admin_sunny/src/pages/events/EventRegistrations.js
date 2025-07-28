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
  Snackbar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import registrationService from '../../services/registrationService';

const EventRegistrations = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    let cancelled = false;
    
    const loadRegistrations = async () => {
      if (cancelled) return;
      
      try {
        setLoading(true);
        console.log('Fetching registrations for event:', eventCode);
        const data = await registrationService.getRegistrations(eventCode);
        
        if (!cancelled) {
          console.log('Registration data received:', data);
          setRegistrations(data.map(registration => ({
            ...registration,
            id: registration.phone
          })));
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
      const data = await registrationService.getRegistrations(eventCode);
      setRegistrations(data.map(registration => ({
        ...registration,
        id: registration.phone
      })));
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

  const handleOpenDialog = (registration = null) => {
    setEditingRegistration(registration);
    setFormData({
      name: registration?.name || '',
      email: registration?.email || '',
      phone: registration?.phone || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRegistration(null);
    setFormData({
      name: '',
      email: '',
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

  const columns = [
    { field: 'phone', headerName: '전화번호', width: 150 },
    { field: 'name', headerName: '이름', width: 200 },
    { field: 'email', headerName: '이메일', width: 250 },
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

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={registrations}
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
            label="이메일"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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