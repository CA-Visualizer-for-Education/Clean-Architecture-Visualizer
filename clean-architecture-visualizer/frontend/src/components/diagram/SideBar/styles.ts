import { styled } from '@mui/material/styles';

export const SIDEBAR_GUTTER_WIDTH_OPEN = 36;
export const SIDEBAR_GUTTER_WIDTH_CLOSED = 44;
const SIDEBAR_PANEL_WIDTH = 'clamp(280px, 25vw, 400px)';

export const SidebarContainer = styled('aside', {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{
  isOpen?: boolean;
}>(({ isOpen = true }) => ({
  width: isOpen
    ? `calc(${SIDEBAR_PANEL_WIDTH} + ${SIDEBAR_GUTTER_WIDTH_OPEN}px)`
    : SIDEBAR_GUTTER_WIDTH_CLOSED,
  alignSelf: 'stretch',
  display: 'flex',
  flexShrink: 0,
  transition: 'width 180ms ease',
  overflow: 'hidden',
}));

export const SidebarGutter = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{
  isOpen?: boolean;
}>(({ isOpen = true }) => ({
  width: isOpen ? SIDEBAR_GUTTER_WIDTH_OPEN : SIDEBAR_GUTTER_WIDTH_CLOSED,
  alignSelf: 'stretch',
  position: 'relative',
  flexShrink: 0,
  backgroundColor: 'transparent',
}));

export const SidebarPanel = styled('div')(({ theme }) => ({
  width: SIDEBAR_PANEL_WIDTH,
  alignSelf: 'stretch',
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflowY: 'auto',
  overflowX: 'hidden',
  backgroundColor: theme.palette.primary.main,
  padding: theme.spacing(2),
}));
