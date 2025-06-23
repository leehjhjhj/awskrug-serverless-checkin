import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';
import AlertMessage from '../../components/common/AlertMessage';
import registrationService from '../../services/registrationService';
import eventService from '../../services/eventService';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ExcelUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  React.useEffect(() => {
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
        message: '이벤트 목록을 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedEvent) {
      setAlert({
        open: true,
        message: '파일과 이벤트를 모두 선택해주세요.',
        severity: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await registrationService.uploadRegistrations(selectedEvent, selectedFile);
      setUploadResult(result);
      setAlert({
        open: true,
        message: '파일이 성공적으로 업로드되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      setAlert({
        open: true,
        message: '파일 업로드에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateUrl = registrationService.downloadTemplate();
    window.open(templateUrl, '_blank');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Excel 업로드
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body1" gutterBottom>
              Excel 파일을 통해 등록자를 일괄 업로드할 수 있습니다. 아래 템플릿을 다운로드하여 사용하세요.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="event-select-label">이벤트 선택</InputLabel>
              <Select
                labelId="event-select-label"
                value={selectedEvent}
                label="이벤트 선택"
                onChange={handleEventChange}
                disabled={loading}
              >
                {events.map((event) => (
                  <MenuItem key={event.event_code} value={event.event_code}>
                    {event.event_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
              disabled={loading}
            >
              파일 선택
              <VisuallyHiddenInput type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
            </Button>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                선택된 파일: {selectedFile.name}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              fullWidth
              disabled={loading}
            >
              템플릿 다운로드
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              fullWidth
              disabled={loading || !selectedFile || !selectedEvent}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? '업로드 중...' : '업로드'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {uploadResult && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            업로드 결과
          </Typography>
          <Typography variant="body1">
            처리된 행 수: {uploadResult.rows_processed}
          </Typography>
          <Typography variant="body1">
            메시지: {uploadResult.message}
          </Typography>
        </Paper>
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

export default ExcelUpload;