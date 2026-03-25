import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const PageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
});

export const Workspace = styled(Box)({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
});

export const SidebarContainer = styled('aside', {
  shouldForwardProp: (prop) => prop !== 'sidebarWidth',
})<{
  sidebarWidth: number;
}>(({ theme, sidebarWidth }) => ({
  width: sidebarWidth,
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2.5),
}));

export const Resizer = styled('div')({
  width: 4,
  cursor: 'col-resize',
});

export const MainViewContainer = styled('main')(({ theme }) => ({
  flexGrow: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: theme.spacing(3),
}));