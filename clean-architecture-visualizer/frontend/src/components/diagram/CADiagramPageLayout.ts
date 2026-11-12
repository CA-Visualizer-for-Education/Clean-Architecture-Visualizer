import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  height: '100%',
  overflow: 'hidden',
});

export const Workspace = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const MainViewContainer = styled('main')(({ theme }) => ({
  flexGrow: 1,
  minWidth: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  padding: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.5),
  },
}));
