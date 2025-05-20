import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Link
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import FormDialog from '../../components/common/FormDialog';
import registrationService from '../../services/registrationService';

const RegistrationUpload = ({ open, onClose, eventCode, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('파일을 선택해주세요');
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      setError(null);
      setResult(null);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      const response = await registrationService.uploadRegistrations(eventCode, file);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(response);
      
      // Notify parent component of successful upload
      setTimeout(() => {
        onUploadComplete();
      }, 2000);
      
    } catch (error) {
      setError('파일 업로드에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open(registrationService.downloadTemplate(), '_blank');
  };

  const resetForm = () => {
    setFile(null);
    setProgress(0);
    setResult(null);
    setError(null);
  };

  return (
    <FormDialog
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="등록자 Excel 업로드"
      onSubmit={handleSubmit}
      submitText="업로드"
      loading={loading}
      maxWidth="md"
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Excel 파일을 업로드하여 이벤트 등록자를 일괄 등록할 수 있습니다.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          파일은 visitor_name, visitor_mobile, visitor_email 열을 포함해야 합니다.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadTemplate}
          sx={{ mt: 1 }}
          size="small"
        >
          템플릿 다운로드
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Alert severity="success" sx={{ mb: 3 }}>
          파일이 성공적으로 처리되었습니다. {result.rows_processed}개의 등록자가 추가되었습니다.
        </Alert>
      )}

      <Box
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          mb: 3,
          backgroundColor: '#f9f9f9'
        }}
      >
        {file ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </Typography>
            <Button
              variant="text"
              color="error"
              onClick={() => setFile(null)}
              size="small"
              disabled={loading}
            >
              파일 제거
            </Button>
          </Box>
        ) : (
          <Box>
            <input
              type="file"
              accept=".xlsx,.xls"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                파일 선택
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary">
              .xlsx 또는 .xls 파일만 업로드 가능합니다
            </Typography>
          </Box>
        )}
      </Box>

      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {progress}% 완료
          </Typography>
        </Box>
      )}
    </FormDialog>
  );
};

export default RegistrationUpload;