import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';
import registrationService from '../../services/registrationService';
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

const ExcelUploadDialog = ({ open, onClose, eventCode, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        uploadService.validateFile(file);
        setSelectedFile(file);
        setError(null);
        setSuccess('파일이 선택되었습니다.');
      } catch (err) {
        setError(err.message);
        setSelectedFile(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('파일을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate file again before upload
      uploadService.validateFile(selectedFile);

      // Upload file using presigned URL
      await uploadService.uploadFile(eventCode, selectedFile);

      setSuccess('파일이 성공적으로 업로드되었습니다.');

      // Reset form after short delay
      setTimeout(() => {
        handleClose();
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }, 1500);

    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || '파일 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateUrl = registrationService.downloadTemplate();
    window.open(templateUrl, '_blank');
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Excel 파일 업로드</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Excel 파일을 통해 등록자를 일괄 업로드할 수 있습니다.
            템플릿을 다운로드하여 사용하세요.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
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
                <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                  선택된 파일: {selectedFile.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                fullWidth
                disabled={loading}
              >
                템플릿 다운로드
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                (센터필드 입장 양식과 동일, xlsx만 가능)
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          취소
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={loading || !selectedFile}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? '업로드 중...' : '업로드'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExcelUploadDialog;
