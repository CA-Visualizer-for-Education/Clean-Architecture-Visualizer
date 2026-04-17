import { Box, Paper, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const LegendRoot = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: `calc(${theme.breakpoints.values.lg}px - ${theme.spacing(8)})`,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: theme.spacing(1.5),
  boxSizing: 'border-box',
  padding: theme.spacing(1, 1, 1),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.25, 1.5, 1.25),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(1.5, 2, 1.5),
  },
}));

export const LegendItems = styled(Stack)({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  justifyItems: 'center',
  alignItems: 'start',
  columnGap: 24,
  rowGap: 16,
});

export const EdgeLegendItem = styled(Stack)({
  width: '100%',
  maxWidth: 160,
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const NodeLegendItem = styled(Stack)({
  width: '100%',
  maxWidth: 160,
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const LegendMedia = styled(Box)({
  width: '100%',
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const EdgePreview = styled(Box)({
  position: 'relative',
  width: 72,
  height: 16,
});

export const EdgeAnchorStart = styled(Box)({
  position: 'absolute',
  left: 2,
  top: '50%',
  width: 2,
  height: 2,
  transform: 'translateY(-50%)',
});

export const EdgeAnchorEnd = styled(Box)({
  position: 'absolute',
  right: 2,
  top: '50%',
  width: 2,
  height: 2,
  transform: 'translateY(-50%)',
});

export const LegendLabel = styled(Typography)({
  textAlign: 'center',
  minHeight: '2.6em',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
});
