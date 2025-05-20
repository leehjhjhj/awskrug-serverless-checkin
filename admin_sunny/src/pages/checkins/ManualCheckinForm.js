import React, { useState } from 'react';
import {
  TextField,
  Grid,
  CircularProgress
} from '@mui/material';
import FormDialog from '../../components/common/FormDialog';

const ManualCheckinForm = ({ open, onClose, onSubmit }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!phone.trim()) {
      setError('전화번호를 입력해주세요');
      return false;
    } else if (!/^01[016789]\d{7,8}$/.test(phone.replace(/-/g, ''))) {
      setError('올바른 전화번호 형식이 아닙니다');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setPhone(e.target.value);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const success = await onSubmit(phone);
      if (success) {
        setPhone('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="수동 체크인"
      onSubmit={handleSubmit}
      submitText="체크인"
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="전화번호"
            fullWidth
            required
            value={phone}
            onChange={handleChange}
            error={Boolean(error)}
            helperText={error || '예: 01012345678'}
            placeholder="01012345678"
          />
        </Grid>
      </Grid>
    </FormDialog>
  );
};

export default ManualCheckinForm;