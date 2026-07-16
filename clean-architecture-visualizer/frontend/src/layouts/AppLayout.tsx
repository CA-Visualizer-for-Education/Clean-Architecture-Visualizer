import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import NavBar from '../components/common/NavBar';

export default function AppLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f1ea',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
