import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  ClickAwayListener,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import CaveLogo from '../../assets/locales/logo_dark.svg';

export const NAV_BAR_HEIGHT = 64;
const LOGO_SIZE = 36;

const CAVE_LEARN_URL =
  'https://ca-visualizer-for-education.github.io/cave-learn/';

const navItemSx = (isActive: boolean) => ({
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: { xs: 'flex-start', md: 'center' },
  px: 2,
  gap: 1,
  borderRadius: '999px',
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 1,
  color: isActive ? 'text.primary' : 'text.secondary',
  bgcolor: isActive ? '#f5f1ea' : 'transparent',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  '&:hover': { bgcolor: 'action.hover' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
});

export default function NavBar() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Navigation and breakpoint changes must reset the disclosure state.
  useEffect(() => {
    // Reset on navigation and breakpoint changes so resizing back stays closed.
    setMenuOpen(false);
  }, [location, isDesktop]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
      <Box
        component="nav"
        aria-label={t('navBar.ariaLabel')}
        onBlur={(event) => {
          // Safari may clear focus before a tapped link receives its click.
          // Only close when focus moves to a known element outside the nav.
          if (
            event.relatedTarget &&
            !event.currentTarget.contains(event.relatedTarget)
          )
            setMenuOpen(false);
        }}
        sx={{
          position: 'relative',
          zIndex: theme.zIndex.appBar,
          flexShrink: 0,
          height: NAV_BAR_HEIGHT,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          px: { xs: 2, md: 3 },
        }}
      >
        <Box
          component={Link}
          to="/"
          aria-label={t('navBar.home')}
          onClick={() => setMenuOpen(false)}
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
          }}
        >
          <Box
            component="img"
            src={CaveLogo}
            alt=""
            sx={{ width: LOGO_SIZE, height: LOGO_SIZE, flexShrink: 0 }}
          />
          <Typography
            component="span"
            sx={{
              fontWeight: 800,
              fontSize: 20,
              lineHeight: 1,
              color: 'text.primary',
              letterSpacing: '0.02em',
            }}
          >
            {t('branding.name')}
          </Typography>
        </Box>

        <IconButton
          ref={menuButtonRef}
          aria-label={t(menuOpen ? 'navBar.closeMenu' : 'navBar.openMenu')}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            ml: 'auto',
            width: 44,
            height: 44,
          }}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>

        <Box
          id={menuId}
          sx={{
            display: { xs: menuOpen ? 'flex' : 'none', md: 'flex' },
            flex: 1,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 1,
            position: { xs: 'absolute', md: 'static' },
            top: '100%',
            left: 0,
            right: 0,
            p: { xs: 2, md: 0 },
            maxHeight: { xs: `calc(100dvh - ${NAV_BAR_HEIGHT}px)`, md: 'none' },
            overflowY: { xs: 'auto', md: 'visible' },
            bgcolor: 'background.paper',
            boxShadow: { xs: 3, md: 'none' },
          }}
        >
          {[
            { to: '/', label: 'navBar.home' },
            { to: '/checker', label: 'navBar.checker' },
            { to: '/project-starter', label: 'navBar.start' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: 'none',
                flexShrink: 0,
                borderRadius: '999px',
              }}
            >
              {({ isActive }) => (
                <Box component="span" sx={navItemSx(isActive)}>
                  {t(label)}
                </Box>
              )}
            </NavLink>
          ))}

          <Box
            sx={{
              ml: { md: 'auto' },
              pl: { md: 2 },
              pt: { xs: 1, md: 0 },
              borderLeft: { md: '1px solid' },
              borderTop: { xs: '1px solid', md: 'none' },
              borderColor: 'divider',
            }}
          >
            <Box
              component="a"
              href={CAVE_LEARN_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              sx={navItemSx(false)}
            >
              {t('navBar.learn')}
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </ClickAwayListener>
  );
}
