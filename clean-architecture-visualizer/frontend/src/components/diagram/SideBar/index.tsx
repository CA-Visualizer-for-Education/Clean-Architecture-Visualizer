import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SIDEBAR_GUTTER_WIDTH_CLOSED,
  SIDEBAR_GUTTER_WIDTH_OPEN,
  SidebarContainer,
  SidebarGutter,
  SidebarPanel,
} from './styles';

interface SidebarProps {
  children: ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (nextOpen: boolean) => void;
}

const OPEN_CHEVRON_RIGHT_OFFSET = 4;

function MobileSideBar({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();

  return (
    <Box sx={{ order: -1, alignSelf: 'flex-end', p: 1.5, flexShrink: 0 }}>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        {t('sidebar.open')}
      </Button>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            id: panelId,
            role: 'dialog',
            'aria-modal': true,
            'aria-labelledby': titleId,
            sx: { width: 'min(360px, 100vw)' },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            gap: 1,
          }}
        >
          <Typography id={titleId} component="h2" variant="h6">
            {t('sidebar.title')}
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            aria-label={t('sidebar.close')}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowWrap: 'anywhere',
            bgcolor: 'primary.main',
            p: 2,
          }}
        >
          {children}
        </Box>
      </Drawer>
    </Box>
  );
}

export const SideBar = ({
  children,
  defaultOpen = false,
  isOpen,
  onOpenChange,
}: SidebarProps) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isControlled = typeof isOpen === 'boolean';
  const open = isControlled ? isOpen : internalIsOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  // Mobile starts closed independently of the saved desktop preference.
  // Switching back to desktop unmounts the modal and restores the inline panel.
  if (!isDesktop) return <MobileSideBar>{children}</MobileSideBar>;

  return (
    <SidebarContainer isOpen={open} aria-label={t('sidebar.title')}>
      <SidebarGutter isOpen={open}>
        <Box
          sx={{
            position: 'absolute',
            left: open
              ? SIDEBAR_GUTTER_WIDTH_OPEN / 2 + OPEN_CHEVRON_RIGHT_OFFSET
              : SIDEBAR_GUTTER_WIDTH_CLOSED / 2,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            aria-label={t(open ? 'sidebar.collapse' : 'sidebar.expand')}
            aria-expanded={open}
            sx={(theme) => ({
              '&:hover': { backgroundColor: theme.palette.action.hover },
            })}
          >
            {open ? (
              <ChevronRightIcon fontSize="large" />
            ) : (
              <ChevronLeftIcon fontSize="large" />
            )}
          </IconButton>
        </Box>
      </SidebarGutter>

      {open && <SidebarPanel>{children}</SidebarPanel>}
    </SidebarContainer>
  );
};

export { SidebarContainer } from './styles';
