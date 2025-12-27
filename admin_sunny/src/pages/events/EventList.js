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
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (cancelled) return;

      try {
        setLoading(true);

        // Load organizations for filter
        const organizationsData = await organizationService.getAllOrganizations();
        if (!cancelled) {
          setOrganizations(organizationsData.map(org => ({
            code: org.organization_code,
            name: org.organization_name
          })));
        }

        // Load events
        const data = organizationCode
          ? await eventService.getEventsByOrganization(organizationCode)
          : await eventService.getAllEvents();

        if (!cancelled) {
          const eventList = data.events || [];
          setEvents(eventList.map(event => ({
            ...event,
            id: event.event_code
          })));
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch events:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [organizationCode]);

  const refetchEvents = async () => {
    try {
      setLoading(true);
      const data = organizationCode
        ? await eventService.getEventsByOrganization(organizationCode)
        : await eventService.getAllEvents();
      const eventList = data.events || [];
      setEvents(eventList.map(event => ({
        ...event,
        id: event.event_code
      })));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationFilter = (event) => {
    const value = event.target.value;
    if (value) {
      setSearchParams({ group: value });
    } else {
      setSearchParams({});
    }
  };

  const handleClearFilter = () => {
    setSearchParams({});
  };

  const handleDelete = async (eventCode) => {
    if (window.confirm('이 이벤트를 삭제하시겠습니까?')) {
      try {
        await eventService.deleteEvent(eventCode);
        refetchEvents();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const filteredEvents = events.filter(event => 
    event.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.event_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { field: 'event_code', headerName: '이벤트 코드', width: 130 },
    { field: 'event_name', headerName: '이벤트 이름', width: 250 },
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

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredEvents}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          loading={loading}
          disableSelectionOnClick
          getRowId={(row) => row.event_code}
        />
      </Paper>
    </Box>
  );
};

export default EventList;