import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DataTable from '../../components/common/DataTable';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingBackdrop from '../../components/common/LoadingBackdrop';
import RegistrationForm from './RegistrationForm';
import RegistrationUpload from './RegistrationUpload';
import registrationService from '../../services/registrationService';

const RegistrationList = () => {
  const { eventCode } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [formOpen, setFormOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (eventCode) {
      fetchRegistrations();
    }
  }, [eventCode]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await registrationService.getRegistrations(eventCode);
      setRegistrations(data.map((reg, index) => ({
        ...reg,
        id: reg.phone || index
      })));
    } catch (error) {
      setAlert({
        open: true,
        message: '등록자 목록을 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (phone) => {
    if (window.confirm('이 등록자를 삭제하시겠습니까?')) {
      try {
        await registrationService.deleteRegistration(eventCode, phone);
        setAlert({
          open: true,
          message: '등록자가 성공적으로 삭제되었습니다.',
          severity: 'success'
        });
        fetchRegistrations();
      } catch (error) {
        setAlert({
          open: true,
          message: '등록자 삭제에 실패했습니다.',
          severity: 'error'
        });
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      await registrationService.addRegistration(eventCode, formData);
      setAlert({
        open: true,
        message: '등록자가 성공적으로 추가되었습니다.',
        severity: 'success'
      });
      setFormOpen(false);
      fetchRegistrations();
      return true;
    } catch (error) {
      setAlert({
        open: true,
        message: '등록자 추가에 실패했습니다.',
        severity: 'error'
      });
      return false;
    }
  };

  const handleUploadComplete = () => {
    setUploadOpen(false);
    fetchRegistrations();
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
          등록자 관리 - {eventCode}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setUploadOpen(true)}
            sx={{ mr: 1 }}
          >
            Excel 업로드
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            등록자 추가
          </Button>
        </Box>
      </Box>

      <DataTable
        rows={registrations}
        columns={columns}
        loading={loading}
      />

      <RegistrationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <RegistrationUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        eventCode={eventCode}
        onUploadComplete={handleUploadComplete}
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

export default RegistrationList;