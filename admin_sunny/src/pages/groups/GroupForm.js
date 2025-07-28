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
  Alert,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import organizationService from '../../services/organizationService';

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
    organization_code: '',
    organization_name: '',
    description: '',
    logo_url: '',
    event_version: []
  });
  
  const [newEventVersion, setNewEventVersion] = useState('');
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    if (isEditMode) {
      const fetchGroup = async () => {
        if (cancelled) return;
        
        try {
          setLoading(true);
          const orgData = await organizationService.getOrganization(groupCode);
          
          if (!cancelled) {
            setFormData({
              organization_code: orgData.organization_code,
              organization_name: orgData.organization_name,
              description: orgData.organization_name, // Use name as description
              logo_url: orgData.full_logo_url || 'https://via.placeholder.com/150', // Use full_logo_url or fallback to placeholder
              event_version: orgData.event_version || []
            });
          }
        } catch (error) {
          if (!cancelled) {
            console.error('Error fetching organization:', error);
            setError('소모임 정보를 불러오는데 실패했습니다.');
            // Fallback to mock data
            setFormData({
              organization_code: mockGroup.group_code,
              organization_name: mockGroup.group_name,
              description: mockGroup.description,
              logo_url: mockGroup.logo_url,
              event_version: ['1', '2'] // Default event versions
            });
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      fetchGroup();
    }
    
    return () => {
      cancelled = true;
    };
  }, [isEditMode, groupCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEventVersion = () => {
    const trimmedVersion = newEventVersion.trim();
    if (trimmedVersion && !formData.event_version.includes(trimmedVersion)) {
      setFormData(prev => ({
        ...prev,
        event_version: [...prev.event_version, trimmedVersion]
      }));
      setNewEventVersion('');
    }
  };

  const handleRemoveEventVersion = (index) => {
    setFormData(prev => ({
      ...prev,
      event_version: prev.event_version.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isEditMode) {
        // For update, use the organizationService
        const updateData = {
          organization_code: formData.organization_code,
          organization_name: formData.organization_name,
          event_version: formData.event_version
        };
        
        await organizationService.updateOrganization(updateData);
        console.log('Organization updated:', updateData);
      } else {
        // Create mode is disabled, but keeping for completeness
        console.log('Create mode is disabled');
        throw new Error('소모임 등록 기능은 비활성화되었습니다.');
      }
      
      setSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/groups');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || '소모임 저장에 실패했습니다. 다시 시도해주세요.');
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
                name="organization_code"
                value={formData.organization_code}
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
                name="organization_name"
                value={formData.organization_name}
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
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                이벤트 버전 관리
              </Typography>
              
              {/* 새 이벤트 버전 추가 */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="새 이벤트 버전"
                  value={newEventVersion}
                  onChange={(e) => setNewEventVersion(e.target.value)}
                  size="small"
                  placeholder="예: 3, v1.0, 2024"
                  helperText="추가할 이벤트 버전을 입력하세요"
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddEventVersion}
                  disabled={!newEventVersion.trim()}
                  sx={{ height: 'fit-content', mt: 1 }}
                >
                  추가
                </Button>
              </Box>
              
              {/* 기존 이벤트 버전 목록 */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  현재 이벤트 버전 ({formData.event_version.length}개)
                </Typography>
                {formData.event_version.length === 0 ? (
                  <Alert severity="info">등록된 이벤트 버전이 없습니다.</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.event_version.map((version, index) => (
                      <Chip
                        key={index}
                        label={version}
                        onDelete={() => handleRemoveEventVersion(index)}
                        deleteIcon={<DeleteIcon />}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                )}
              </Box>
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