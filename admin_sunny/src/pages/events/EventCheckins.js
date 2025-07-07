import React, { useState } from 'react';
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
  Grid,
  Card,
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import checkinService from '../../services/checkinService';

const EventCheckins = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  
  const [searchPhone, setSearchPhone] = useState('');
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    checked_at: dayjs(),
    event_version: '1'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      setSnackbar({
        open: true,
        message: '전화번호를 입력해주세요.',
        severity: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      const data = await checkinService.getCheckin(searchPhone, eventCode);
      setCheckin(data);
      setSnackbar({
        open: true,
        message: '체크인 정보를 찾았습니다.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to fetch checkin:', error);
      setCheckin(null);
      setSnackbar({
        open: true,
        message: '체크인 정보를 찾을 수 없습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (editData = null) => {
    setIsEditing(!!editData);
    setFormData({
      phone: editData?.phone || '',
      name: editData?.name || '',
      email: editData?.email || '',
      checked_at: editData?.checked_at ? dayjs(editData.checked_at) : dayjs(),
      event_version: editData?.event_version || '1'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setFormData({
      phone: '',
      name: '',
      email: '',
      checked_at: dayjs(),
      event_version: '1'
    });
  };

  const handleSubmit = async () => {
    try {
      const checkinData = {
        phone: formData.phone,
        event_code: eventCode,
        name: formData.name,
        email: formData.email,
        checked_at: formData.checked_at.toISOString(),
        event_version: formData.event_version
      };

      if (isEditing) {
        await checkinService.updateCheckin(formData.phone, eventCode, checkinData);
        setSnackbar({
          open: true,
          message: '체크인 정보가 수정되었습니다.',
          severity: 'success'
        });
        // Update current checkin if it's the same phone
        if (checkin && checkin.phone === formData.phone) {
          setCheckin({ ...checkin, ...checkinData });
        }
      } else {
        await checkinService.createCheckin(checkinData);
        setSnackbar({
          open: true,
          message: '체크인이 추가되었습니다.',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save checkin:', error);
      setSnackbar({
        open: true,
        message: '체크인 저장에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (phone) => {
    if (window.confirm('이 체크인을 삭제하시겠습니까?')) {
      try {
        await checkinService.deleteCheckin(phone, eventCode);
        setSnackbar({
          open: true,
          message: '체크인이 삭제되었습니다.',
          severity: 'success'
        });
        setCheckin(null);
      } catch (error) {
        console.error('Failed to delete checkin:', error);
        setSnackbar({
          open: true,
          message: '체크인 삭제에 실패했습니다.',
          severity: 'error'
        });
      }
    }
  };

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
            체크인 관리 - {eventCode}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          체크인 추가
        </Button>
      </Box>

      {/* 검색 영역 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          체크인 검색
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="전화번호"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="전화번호를 입력하세요"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              검색
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 검색 결과 */}
      {checkin && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6" component="h2">
                체크인 정보
              </Typography>
              <Box>
                <Tooltip title="수정">
                  <IconButton
                    onClick={() => handleOpenDialog(checkin)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="삭제">
                  <IconButton
                    onClick={() => handleDelete(checkin.phone)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  전화번호
                </Typography>
                <Typography variant="body1">
                  {checkin.phone}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  이름
                </Typography>
                <Typography variant="body1">
                  {checkin.name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  이메일
                </Typography>
                <Typography variant="body1">
                  {checkin.email || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  체크인 시간
                </Typography>
                <Typography variant="body1">
                  {new Date(checkin.checked_at).toLocaleString('ko-KR')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  이벤트 버전
                </Typography>
                <Typography variant="body1">
                  {checkin.event_version}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 체크인 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? '체크인 수정' : '체크인 추가'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="전화번호"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={isEditing}
            sx={{ mb: 2 }}
            helperText={isEditing ? "수정 시 전화번호는 변경할 수 없습니다." : ""}
          />
          <TextField
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
          <DateTimePicker
            label="체크인 시간"
            value={formData.checked_at}
            onChange={(newValue) => setFormData({ ...formData, checked_at: newValue })}
            renderInput={(params) => (
              <TextField {...params} fullWidth variant="outlined" sx={{ mb: 2 }} />
            )}
          />
          <TextField
            margin="dense"
            label="이벤트 버전"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.event_version}
            onChange={(e) => setFormData({ ...formData, event_version: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? '수정' : '추가'}
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

export default EventCheckins;