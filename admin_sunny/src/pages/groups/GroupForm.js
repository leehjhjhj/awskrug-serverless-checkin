import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock data for a single group
const mockGroup = {
  group_code: 'awskrug',
  group_name: 'AWS 한국 사용자 모임',
  description: 'AWS 클라우드 기술을 공유하는 한국 사용자 모임',
  created_at: '2020-01-01',
  logo_url: 'https://via.placeholder.com/150'
};

const GroupForm = () => {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!groupCode;
  
  const [formData, setFormData] = useState({
    group_code: '',
    group_name: '',
    description: '',
    logo_url: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      // Simulate API call to fetch group data
      const fetchGroup = async () => {
        try {
          // In a real app, this would be an API call
          setTimeout(() => {
            setFormData(mockGroup);
            setLoading(false);
          }, 500);
        } catch (error) {
          console.error('Error fetching group:', error);
          setError('그룹 정보를 불러오는데 실패했습니다.');
          setLoading(false);
        }
      };

      fetchGroup();
    }
  }, [isEditMode, groupCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', formData);
      setSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/groups');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('소모임 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <Box sx={{ p: 3 }}>로딩 중...</Box>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h1">
            {isEditMode ? '소모임 수정' : '새 소모임 등록'}
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/groups')}
          >
            목록으로
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            소모임이 성공적으로 저장되었습니다.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="소모임 코드"
                name="group_code"
                value={formData.group_code}
                onChange={handleChange}
                disabled={isEditMode}
                helperText={isEditMode ? "소모임 코드는 수정할 수 없습니다" : "영문, 숫자, 하이픈만 사용 가능"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="소모임 이름"
                name="group_name"
                value={formData.group_name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="설명"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="로고 URL"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                helperText="로고 이미지의 URL을 입력하세요"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default GroupForm;