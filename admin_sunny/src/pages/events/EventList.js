import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import eventService from '../../services/eventService';
import organizationService from '../../services/organizationService';

const EventList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const organizationCode = searchParams.get('group');
  const [events, setEvents] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [refreshKey, setRefreshKey] = useState(0);

  // 필터용 조직 목록은 최초 1회만 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const organizationsData = await organizationService.getAllOrganizations();
        if (!cancelled) {
          setOrganizations(organizationsData.map(org => ({
            code: org.organization_code,
            name: org.organization_name
          })));
        }
      } catch (error) {
        if (!cancelled) console.error('Failed to fetch organizations:', error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 검색어 디바운스(300ms) + 검색 변경 시 첫 페이지로 리셋
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPaginationModel(prev => ({ ...prev, page: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 이벤트 목록: 서버 사이드 페이지네이션 + 검색
  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = {
          page: paginationModel.page,
          size: paginationModel.pageSize,
          search: debouncedSearch || undefined,
        };
        const data = organizationCode
          ? await eventService.getEventsByOrganization(organizationCode, params)
          : await eventService.getAllEvents(params);

        if (!cancelled) {
          const eventList = data.events || [];
          setEvents(eventList.map(event => ({ ...event, id: event.event_code })));
          setRowCount(data.total ?? 0);
        }
      } catch (error) {
        if (!cancelled) console.error('Failed to fetch events:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvents();
    return () => { cancelled = true; };
  }, [organizationCode, paginationModel.page, paginationModel.pageSize, debouncedSearch, refreshKey]);

  const handleOrganizationFilter = (event) => {
    const value = event.target.value;
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    if (value) {
      setSearchParams({ group: value });
    } else {
      setSearchParams({});
    }
  };

  const handleClearFilter = () => {
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    setSearchParams({});
  };

  const handleDelete = async (eventCode) => {
    if (window.confirm('이 이벤트를 삭제하시겠습니까?')) {
      try {
        await eventService.deleteEvent(eventCode);
        setRefreshKey(k => k + 1);
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const columns = [
    { field: 'event_code', headerName: '이벤트 코드', width: 130 },
    { field: 'event_name', headerName: '이벤트 이름', width: 250 },
    {
      field: 'is_private',
      headerName: '공개여부',
      width: 110,
      renderCell: (params) => (
        params.value
          ? <Chip label="비공개" size="small" color="default" />
          : <Chip label="공개" size="small" color="success" variant="outlined" />
      ),
    },
    {
      field: 'event_date_time',
      headerName: '이벤트 일시',
      width: 200,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleString('ko-KR');
      }
    },
    { 
      field: 'code_expired_at', 
      headerName: '코드 만료일시', 
      width: 200,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleString('ko-KR');
      }
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="상세보기">
            <IconButton
              onClick={() => navigate(`/events/${params.row.event_code}`)}
              size="small"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="수정">
            <IconButton
              onClick={() => navigate(`/events/${params.row.event_code}/edit`)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton
              onClick={() => handleDelete(params.row.event_code)}
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
        <Typography variant="h5" component="h1">
          이벤트 관리
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/events/new')}
        >
          이벤트 생성
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="organization-filter-label">소모임 필터</InputLabel>
            <Select
              labelId="organization-filter-label"
              id="organization-filter"
              value={organizationCode || ''}
              label="소모임 필터"
              onChange={handleOrganizationFilter}
            >
              <MenuItem value="">
                <em>전체 보기</em>
              </MenuItem>
              {organizations.map((org) => (
                <MenuItem key={org.code} value={org.code}>
                  {org.name} ({org.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {organizationCode && (
            <Chip
              label={`필터: ${organizationCode}`}
              onDelete={handleClearFilter}
              color="primary"
              deleteIcon={<ClearIcon />}
            />
          )}
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="이벤트 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={events}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          getRowId={(row) => row.event_code}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default EventList;