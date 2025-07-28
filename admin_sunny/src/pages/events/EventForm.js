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
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Checkbox,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import eventService from '../../services/eventService';
import organizationService from '../../services/organizationService';

// Mock data for organizations
const mockOrganizations = [
  { code: 'awskrug', name: 'AWS 한국 사용자 모임', description: 'AWS 기술 공유 및 네트워킹' },
  { code: 'ausg', name: 'AWSKRUG 대학생 모임', description: '대학생을 위한 AWS 학습 그룹' },
  { code: 'sls', name: 'Serverless Korea', description: '서버리스 기술 전문 커뮤니티' },
  { code: 'devops', name: 'DevOps Korea', description: 'DevOps 실무진 모임' },
  { code: 'data', name: 'Data Engineering Korea', description: '데이터 엔지니어링 전문가 그룹' }
];

// Mock data for a single event
const mockEvent = {
  event_code: 'event123',
  event_name: '2023년 7월 정기 모임',
  group_code: 'awskrug',
  event_date_time: '2023-07-15T18:00:00',
  code_expired_at: '2023-07-15T21:00:00',
  description: 'AWS 서비스 업데이트 및 사용 사례 공유',
  qr_url: 'https://via.placeholder.com/150'
};

const EventForm = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!eventCode;
  
  const [formData, setFormData] = useState({
    event_name: '',
    organization_code: '',
    event_date_time: dayjs(),
    code_expired_at: dayjs().add(3, 'hour'),
    description: '',
    event_version: '1'
  });
  
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [organizationDetail, setOrganizationDetail] = useState(null);
  const [availableEventVersions, setAvailableEventVersions] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [loadingOrganization, setLoadingOrganization] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [autoExpire, setAutoExpire] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    // Fetch organizations
    const fetchOrganizations = async () => {
      if (cancelled) return;
      
      try {
        const organizationsData = await organizationService.getAllOrganizations();
        
        if (!cancelled) {
          // Transform API response to match our component structure
          const transformedOrgs = organizationsData.map(org => ({
            code: org.organization_code,
            name: org.organization_name,
            description: org.organization_name // Use name as description for now
          }));
          setOrganizations(transformedOrgs);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching organizations:', error);
          // Fallback to mock data
          setOrganizations(mockOrganizations);
        }
      }
    };

    fetchOrganizations();

    // If in edit mode, fetch event data
    if (isEditMode) {
      const fetchEvent = async () => {
        if (cancelled) return;
        
        try {
          const eventData = await eventService.getEventByCode(eventCode);
          
          if (!cancelled) {
            const orgData = mockOrganizations.find(org => org.code === eventData.organization_code);
            setSelectedOrganization(orgData);
            setFormData({
              event_name: eventData.event_name,
              organization_code: eventData.organization_code,
              event_date_time: dayjs(eventData.event_date_time),
              code_expired_at: dayjs(eventData.code_expired_at),
              description: eventData.description,
              event_version: eventData.event_version
            });
            setLoading(false);
          }
        } catch (error) {
          if (!cancelled) {
            console.error('Error fetching event:', error);
            setError('이벤트 정보를 불러오는데 실패했습니다.');
            setLoading(false);
          }
        }
      };

      fetchEvent();
    }
    
    return () => {
      cancelled = true;
    };
  }, [isEditMode, eventCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrganizationChange = async (event, newValue) => {
    setSelectedOrganization(newValue);
    setFormData(prev => ({
      ...prev,
      organization_code: newValue ? newValue.code : '',
      event_version: '1' // Reset to default when organization changes
    }));
    
    // Clear previous organization detail and event versions
    setOrganizationDetail(null);
    setAvailableEventVersions([]);
    
    // Fetch organization detail if selected
    if (newValue && newValue.code) {
      try {
        setLoadingOrganization(true);
        const orgDetail = await organizationService.getOrganization(newValue.code);
        setOrganizationDetail(orgDetail);
        setAvailableEventVersions(orgDetail.event_version || []);
        
        // Set the first available event version as default
        if (orgDetail.event_version && orgDetail.event_version.length > 0) {
          setFormData(prev => ({
            ...prev,
            event_version: orgDetail.event_version[0]
          }));
        }
      } catch (error) {
        console.error('Error fetching organization detail:', error);
        setError('조직 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoadingOrganization(false);
      }
    }
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If auto expire is enabled, set expiration to 3 hours after event start
    if (name === 'event_date_time' && autoExpire) {
      setFormData(prev => ({
        ...prev,
        code_expired_at: value.add(3, 'hour')
      }));
    }
  };

  const handleAutoExpireChange = (e) => {
    const checked = e.target.checked;
    setAutoExpire(checked);
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        code_expired_at: prev.event_date_time.add(3, 'hour')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare payload according to API spec
      const payload = {
        event_date_time: formData.event_date_time.toISOString(),
        code_expired_at: formData.code_expired_at.toISOString(),
        description: formData.description,
        event_name: formData.event_name,
        event_version: formData.event_version,
        organization_code: formData.organization_code
      };
      
      let result;
      if (isEditMode) {
        // For update, we need to include event_code in the payload
        result = await eventService.updateEvent(eventCode, {
          ...payload,
          event_code: eventCode
        });
      } else {
        // For create, event_code will be generated by the API
        result = await eventService.createEvent(payload);
      }
      
      console.log('Event saved successfully:', result);
      setSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/events');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || '이벤트 저장에 실패했습니다. 다시 시도해주세요.');
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
            {isEditMode ? '이벤트 수정' : '새 이벤트 등록'}
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/events')}
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
            이벤트가 성공적으로 저장되었습니다.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="이벤트 이름"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={organizations}
                getOptionLabel={(option) => option.name || ''}
                value={selectedOrganization}
                onChange={handleOrganizationChange}
                disabled={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="조직 검색 및 선택"
                    placeholder="조직명으로 검색하세요..."
                    variant="outlined"
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">
                        {option.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.code} | {option.description}
                      </Typography>
                    </Box>
                  </Box>
                )}
                filterOptions={(options, { inputValue }) => {
                  const filterValue = inputValue.toLowerCase();
                  return options.filter(option => 
                    option.name.toLowerCase().includes(filterValue) ||
                    option.code.toLowerCase().includes(filterValue) ||
                    option.description.toLowerCase().includes(filterValue)
                  );
                }}
                noOptionsText="검색 결과가 없습니다"
                loadingText="조직을 불러오는 중..."
                loading={loading && organizations.length === 0}
              />
              <FormHelperText>이벤트가 속한 조직을 선택하세요</FormHelperText>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="이벤트 일시"
                value={formData.event_date_time}
                onChange={(value) => handleDateChange('event_date_time', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <DateTimePicker
                  label="코드 만료 시간"
                  value={formData.code_expired_at}
                  onChange={(value) => handleDateChange('code_expired_at', value)}
                  disabled={autoExpire}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoExpire}
                      onChange={handleAutoExpireChange}
                    />
                  }
                  label="이벤트 시작 3시간 후 자동 만료"
                />
              </Box>
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
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="event-version-label">이벤트 버전</InputLabel>
                <Select
                  labelId="event-version-label"
                  id="event-version-select"
                  label="이벤트 버전"
                  name="event_version"
                  value={formData.event_version}
                  onChange={handleChange}
                  disabled={!selectedOrganization || availableEventVersions.length === 0}
                >
                  {availableEventVersions.map((version) => (
                    <MenuItem key={version} value={version}>
                      {version}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {selectedOrganization 
                    ? (availableEventVersions.length > 0 
                        ? `${availableEventVersions.length}개의 버전 사용 가능` 
                        : loadingOrganization 
                          ? "조직 정보를 불러오는 중..." 
                          : "사용 가능한 버전이 없습니다")
                    : "먼저 조직을 선택하세요"}
                </FormHelperText>
              </FormControl>
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

export default EventForm;