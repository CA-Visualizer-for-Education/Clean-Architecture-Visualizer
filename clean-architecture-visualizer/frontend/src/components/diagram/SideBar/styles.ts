import { styled } from '@mui/material/styles';

export const SIDEBAR_GUTTER_WIDTH_OPEN = 36;
export const SIDEBAR_GUTTER_WIDTH_CLOSED = 44;

export const SidebarContainer = styled('aside', {
	shouldForwardProp: (prop) => prop !== 'isOpen',
})<{
	isOpen?: boolean;
}>(({ isOpen = true }) => ({
	width: isOpen
		? `calc(25vw + ${SIDEBAR_GUTTER_WIDTH_OPEN}px)`
		: SIDEBAR_GUTTER_WIDTH_CLOSED,
	height: '100%',
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
	height: '100%',
	position: 'relative',
	flexShrink: 0,
	backgroundColor: 'transparent',
}));

export const SidebarPanel = styled('div')(({ theme }) => ({
	width: '25vw',
	height: '100%',
	flexShrink: 0,
	borderRight: `1px solid ${theme.palette.divider}`,
	overflowY: 'auto',
	overflowX: 'hidden',
	backgroundColor: theme.palette.primary.main,
	padding: theme.spacing(2),
}));
