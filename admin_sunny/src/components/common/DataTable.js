import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';

const DataTable = ({ rows, columns, loading, pageSize = 10, ...props }) => {
  return (
    <Paper sx={{ width: '100%', height: 400 }}>
      <Box sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          autoHeight={false}
          {...props}
        />
      </Box>
    </Paper>
  );
};

export default DataTable;