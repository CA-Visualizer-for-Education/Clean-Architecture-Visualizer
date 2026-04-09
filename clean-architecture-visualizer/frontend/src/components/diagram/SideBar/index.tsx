import { useState, type ReactNode } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { IconButton, Box } from '@mui/material';
import {
    SidebarContainer,
    SidebarGutter,
    SidebarPanel,
    SIDEBAR_GUTTER_WIDTH_OPEN,
    SIDEBAR_GUTTER_WIDTH_CLOSED,
} from './styles';

interface SidebarProps {
    children: ReactNode;
    defaultOpen?: boolean;
    isOpen?: boolean;
    onOpenChange?: (nextOpen: boolean) => void;
}

const OPEN_CHEVRON_RIGHT_OFFSET = 4;

export const SideBar = ({ children, defaultOpen = false, isOpen, onOpenChange }: SidebarProps) => {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
    const isControlled = typeof isOpen === 'boolean';
    const open = isControlled ? isOpen : internalIsOpen;

    const setOpen = (nextOpen: boolean) => {
        if (!isControlled) {
            setInternalIsOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
    };

    return (
        <SidebarContainer isOpen={open}>
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
                        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
                        sx={(theme) => ({
                            '&:hover': { backgroundColor: theme.palette.action.hover },
                        })}
                    >
                        {open ? <ChevronRightIcon fontSize="large" /> : <ChevronLeftIcon fontSize="large" />}
                    </IconButton>
                </Box>
            </SidebarGutter>

            {open && <SidebarPanel>{children}</SidebarPanel>}
        </SidebarContainer>
    );
};

export { SidebarContainer } from './styles';



