import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import eventService from '../../services/eventService';

const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data.map(event => ({
        ...event,
        id: event.event_code
      })));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventCode) => {
    if (window.confirm('이 이벤트를 삭제하시겠습니까?')) {
      try {
        await eventService.deleteEvent(eventCode);
        fetchEvents();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const filteredEvents = events.filter(event => 
    event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.event_code.toLowerCase().includes(searchTerm.toLowerCase())
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
        />
      </Paper>
    </Box>
  );
};

export default EventList;