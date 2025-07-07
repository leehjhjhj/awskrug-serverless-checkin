import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Grid, Autocomplete, TextField
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';
import AlertMessage from '../../components/common/AlertMessage';
import registrationService from '../../services/registrationService';
import eventService from '../../services/eventService';
import uploadService from '../../services/uploadService';

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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    
    const fetchEvents = async () => {
      if (cancelled) return;
      
      try {
        setLoading(true);
        const data = await eventService.getAllEvents();
        
        if (!cancelled) {
          setEvents(data.events || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch events for upload:', error);
          setAlert({
            open: true,
            message: '이벤트 목록을 불러오는데 실패했습니다.',
            severity: 'error'
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchEvents();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        uploadService.validateFile(file);
        setSelectedFile(file);
        setAlert({
          open: true,
          message: '파일이 선택되었습니다.',
          severity: 'success'
        });
      } catch (error) {
        setAlert({
          open: true,
          message: error.message,
          severity: 'error'
        });
        setSelectedFile(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleEventChange = (event, newValue) => {
    setSelectedEvent(newValue);
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
      
      // Validate file again before upload
      uploadService.validateFile(selectedFile);
      
      // Upload file using presigned URL
      const eventCode = selectedEvent.event_code;
      const uploadResult = await uploadService.uploadFile(eventCode, selectedFile);
      
      setUploadResult({
        message: '파일이 성공적으로 S3에 업로드되었습니다.',
        file_key: uploadResult.fileKey,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        upload_time: new Date().toISOString()
      });
      
      setAlert({
        open: true,
        message: '파일이 성공적으로 업로드되었습니다.',
        severity: 'success'
      });
      
      // Reset form
      setSelectedFile(null);
      setSelectedEvent(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      setAlert({
        open: true,
        message: error.message || '파일 업로드에 실패했습니다.',
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
            <Autocomplete
              fullWidth
              options={events}
              getOptionLabel={(option) => option.event_name || ''}
              value={selectedEvent}
              onChange={handleEventChange}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="이벤트 검색 및 선택"
                  placeholder="이벤트명으로 검색하세요..."
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      {option.event_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.organization_code} | {new Date(option.event_date_time).toLocaleDateString('ko-KR')}
                    </Typography>
                  </Box>
                </Box>
              )}
              filterOptions={(options, { inputValue }) => {
                const filterValue = inputValue.toLowerCase();
                return options.filter(option => 
                  option.event_name.toLowerCase().includes(filterValue) ||
                  option.organization_code.toLowerCase().includes(filterValue) ||
                  option.event_code.toLowerCase().includes(filterValue)
                );
              }}
              noOptionsText="검색 결과가 없습니다"
              loadingText="이벤트를 불러오는 중..."
              loading={loading && events.length === 0}
            />
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
              <VisuallyHiddenInput 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileChange} 
              />
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1">
                메시지: {uploadResult.message}
              </Typography>
            </Grid>
            {uploadResult.file_key && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  파일 키: {uploadResult.file_key}
                </Typography>
              </Grid>
            )}
            {uploadResult.file_name && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  파일명: {uploadResult.file_name}
                </Typography>
              </Grid>
            )}
            {uploadResult.file_size && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  파일 크기: {(uploadResult.file_size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Grid>
            )}
            {uploadResult.upload_time && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  업로드 시간: {new Date(uploadResult.upload_time).toLocaleString('ko-KR')}
                </Typography>
              </Grid>
            )}
          </Grid>
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