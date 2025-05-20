import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ mt: 5, mb: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} AWSKRUG 서버리스 그룹
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <Link href="https://github.com/awskrug/serverless-checkin" target="_blank" rel="noopener" color="inherit">
          GitHub
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
