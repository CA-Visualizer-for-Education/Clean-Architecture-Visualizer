import { Paper } from '@mui/material';
import { darken, styled } from '@mui/material/styles';
import type { CALayerKey, CANode } from '../../../lib/types';

export type LayerColor = CALayerKey;

export const NodePaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'layerColor' && prop !== 'status' && prop !== 'isInteractive',
})<{ layerColor: LayerColor; status: CANode['status']; isInteractive?: boolean }>(({
  theme,
  layerColor,
  status,
  isInteractive,
}) => {
  const canInteract = isInteractive ?? status !== 'MISSING';

  return ({
  boxSizing: 'border-box',
  width: 'clamp(88px, 12vw, 152px)',
  minWidth: 'clamp(88px, 12vw, 152px)',
  maxWidth: 'clamp(88px, 12vw, 152px)',
  marginTop: theme.spacing(0.3),
  marginBottom: theme.spacing(0.3),
  marginLeft: 'auto',
  marginRight: 'auto',
  backgroundColor: theme.palette[layerColor].main,
  border: '2px solid',
  borderColor: theme.palette[layerColor].contrastText,
  color: theme.palette[layerColor].contrastText,
  paddingLeft: theme.spacing(1.25),
  paddingRight: theme.spacing(1.25),
  paddingTop: theme.spacing(0.55),
  paddingBottom: theme.spacing(0.55),
  ...(status === 'MISSING' && {
    borderStyle: 'dashed',
    opacity: 0.6,
  }),
  ...(status === 'VIOLATION' && {
    borderColor: theme.palette.error.main,
    borderWidth: 5,
  }),
  transition: 'background-color 120ms ease, transform 120ms ease, box-shadow 120ms ease',
  ...(canInteract && {
    '&:hover': {
      backgroundColor: darken(theme.palette[layerColor].main, 0.1),
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[3],
      cursor: 'pointer',
    },
    '&:active': {
      backgroundColor: darken(theme.palette[layerColor].main, 0.2),
      transform: 'translateY(0)',
      boxShadow: theme.shadows[1],
    },
  }),
  });
});
