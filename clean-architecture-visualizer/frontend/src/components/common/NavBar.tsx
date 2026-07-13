import { Link, NavLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CaveLogo from '../../assets/locales/logo_dark.svg';

export const NAV_BAR_HEIGHT = 64;
const LOGO_SIZE = 36;
const LOGO_GROUP_WIDTH = 180;
const NAV_ITEM_MIN_WIDTH = 100;
const NAV_ITEM_HEIGHT = 40;

const CAVE_LEARN_URL =
  'https://ca-visualizer-for-education.github.io/cave-learn/';

const navItemSx = (isActive: boolean) => ({
  flexShrink: 0,
  minWidth: NAV_ITEM_MIN_WIDTH,
  width: NAV_ITEM_MIN_WIDTH,
  height: NAV_ITEM_HEIGHT,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: 2.5,
  borderRadius: '999px',
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 1,
  color: isActive ? 'text.primary' : 'text.secondary',
  bgcolor: isActive ? '#f5f1ea' : 'transparent',
  whiteSpace: 'nowrap',
});

export default function NavBar() {
  const { t } = useTranslation('common');

  return (
    <Box
      component="nav"
      aria-label={t('navBar.ariaLabel')}
      sx={{
        flexShrink: 0,
        height: NAV_BAR_HEIGHT,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 3,
        px: 3,
      }}
    >
      <Box
        component={Link}
        to="/"
        aria-label={t('navBar.home')}
        sx={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          width: LOGO_GROUP_WIDTH,
          minWidth: LOGO_GROUP_WIDTH,
          textDecoration: 'none',
        }}
      >
        <Box
          component="img"
          src={CaveLogo}
          alt=""
          sx={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            minWidth: LOGO_SIZE,
            minHeight: LOGO_SIZE,
            flexShrink: 0,
          }}
        />
        <Typography
          component="span"
          sx={{
            flexShrink: 0,
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

      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 1,
        }}
      >
        <NavLink to="/" end style={{ textDecoration: 'none', flexShrink: 0 }}>
          {({ isActive }) => (
            <Box component="span" sx={navItemSx(isActive)}>
              {t('navBar.home')}
            </Box>
          )}
        </NavLink>

        <NavLink
          to="/checker"
          style={{ textDecoration: 'none', flexShrink: 0 }}
        >
          {({ isActive }) => (
            <Box component="span" sx={navItemSx(isActive)}>
              {t('navBar.checker')}
            </Box>
          )}
        </NavLink>

        <Box
          component="a"
          href={CAVE_LEARN_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ ...navItemSx(false), textDecoration: 'none' }}
        >
          {t('navBar.learn')}
        </Box>

        <NavLink
          to="/project-starter"
          style={{ textDecoration: 'none', flexShrink: 0 }}
        >
          {({ isActive }) => (
            <Box component="span" sx={navItemSx(isActive)}>
              {t('navBar.start')}
            </Box>
          )}
        </NavLink>
      </Box>
    </Box>
  );
}
