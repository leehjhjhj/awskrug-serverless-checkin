import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../components/common/DataTable';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingBackdrop from '../../components/common/LoadingBackdrop';
import ManualCheckinForm from './ManualCheckinForm';
import checkinService from '../../services/checkinService';

const CheckinList = () => {
  const { eventCode } = useParams();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (eventCode) {
      fetchCheckins();
    }
  }, [eventCode]);

  const fetchCheckins = async () => {
    try {
      setLoading(true);
      const data = await checkinService.getCheckins(eventCode);
      setCheckins(data.map((checkin, index) => ({
        ...checkin,
        id: checkin.phone || index
      })));
    } catch (error) {
      setAlert({
        open: true,
        message: '체크인 목록을 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (phone) => {
    if (window.confirm('이 체크인 기록을 삭제하시겠습니까?')) {
      try {
        await checkinService.deleteCheckin(phone, eventCode);
        setAlert({
          open: true,
          message: '체크인 기록이 성공적으로 삭제되었습니다.',
          severity: 'success'
        });
        fetchCheckins();
      } catch (error) {
        setAlert({
          open: true,
          message: '체크인 기록 삭제에 실패했습니다.',
          severity: 'error'
        });
      }
    }
  };

  const handleManualCheckin = async (phone) => {
    try {
      const result = await checkinService.manualCheckin(eventCode, phone);
      setAlert({
        open: true,
        message: `${result.name || '참가자'}가 성공적으로 체크인되었습니다.`,
        severity: 'success'
      });
      setFormOpen(false);
      fetchCheckins();
      return true;
    } catch (error) {
      setAlert({
        open: true,
        message: '체크인에 실패했습니다. 등록된 참가자인지 확인해주세요.',
        severity: 'error'
      });
      return false;
    }
  };

  const columns = [
    { field: 'name', headerName: '이름', width: 150 },
    { 
      field: 'phone', 
      headerName: '전화번호', 
      width: 200,
      valueFormatter: (params) => {
        // Display masked phone number
        return params.value ? '********' : '';
      }
    },
    { field: 'email', headerName: '이메일', width: 250 },
    { 
      field: 'checked_at', 
      headerName: '체크인 시간', 
      width: 200,
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleString('ko-KR') : '';
      }
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="삭제">
          <IconButton
            onClick={() => handleDelete(params.row.phone)}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          체크인 관리 - {eventCode}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          수동 체크인
        </Button>
      </Box>

      <DataTable
        rows={checkins}
        columns={columns}
        loading={loading}
      />

      <ManualCheckinForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleManualCheckin}
      />

      <AlertMessage
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        severity={alert.severity}
        message={alert.message}
      />

      <LoadingBackdrop open={loading} />
    </Box>
  );
};

export default CheckinList;