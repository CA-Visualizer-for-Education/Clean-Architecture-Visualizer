import { styled } from '@mui/material/styles';
import { Box, Paper, Chip, Typography } from '@mui/material';
import { CALayerKey } from '../../../lib';

export const ViewerContainer = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px', // theme.spacing(2)
  overflow: 'hidden',
});

export const HeaderContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
});

export const EditorCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  flexGrow: 1, 
  display: 'flex',
  flexDirection: 'column',
  paddingTop: theme.spacing(2),
  minHeight: 0,
  height: '100%',
}));

export const LayerChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'layerkey',
})<{ layerkey: CALayerKey }>(({ theme, layerkey }) => ({
  backgroundColor: theme.palette[layerkey].main,
  color: theme.palette[layerkey].contrastText,
  fontWeight: 700,
  borderRadius: '8px',
  fontSize: '0.75rem',
}));

export const StatusContainer = styled(Box)<{ isError?: boolean }>(({ isError, theme }) => ({
  padding: theme.spacing(4),
  color: isError ? theme.palette.error.main : theme.palette.text.secondary,
}));

export const BreadcrumbPath = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isLast',
})<{ isLast?: boolean }>(({ theme, isLast }) => ({
  variant: 'code',
  fontSize: '0.85rem',
  fontWeight: isLast ? 600 : 400,
  color: isLast ? theme.palette.text.primary : theme.palette.text.secondary,
}));