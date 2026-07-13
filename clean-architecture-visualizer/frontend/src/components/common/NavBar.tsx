import { Link, NavLink, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CaveLogo from '../../assets/locales/logo_dark.svg';

export const NAV_BAR_HEIGHT = 64;
const LOGO_SIZE = 36;
const LOGO_GROUP_WIDTH = 180;
const NAV_ITEM_MIN_WIDTH = 100;
const NAV_ITEM_HEIGHT = 40;

const NAV_ITEMS = [
  { to: '/', labelKey: 'navBar.home', end: true as const },
  { to: '/learning', labelKey: 'navBar.diagram', matchDiagram: true },
  { to: '/test-yourself', labelKey: 'navBar.testYourself' },
] as const;

function isNavItemActive(
  to: string,
  matchDiagram: boolean | undefined,
  pathname: string,
  navIsActive: boolean
): boolean {
  if (to === '/') {
    return navIsActive;
  }
  if (matchDiagram) {
    return navIsActive || pathname.includes('/diagram');
  }
  return navIsActive;
}

export default function NavBar() {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();

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
        <Box
          component="span"
          sx={{
            flexShrink: 0,
            bgcolor: 'useCases.main',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.2,
            px: 0.75,
            py: 0.25,
            borderRadius: '4px',
            letterSpacing: '0.06em',
          }}
        >
          {t('navBar.learnBadge')}
        </Box>
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
        {NAV_ITEMS.map(({ to, labelKey, ...item }) => (
          <NavLink
            key={to}
            to={to}
            end={'end' in item ? item.end : false}
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            {({ isActive: navIsActive }) => {
              const isActive = isNavItemActive(
                to,
                'matchDiagram' in item ? item.matchDiagram : false,
                pathname,
                navIsActive
              );

              return (
                <Box
                  component="span"
                  sx={{
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
                  }}
                >
                  {t(labelKey)}
                </Box>
              );
            }}
          </NavLink>
        ))}
      </Box>
    </Box>
  );
}
