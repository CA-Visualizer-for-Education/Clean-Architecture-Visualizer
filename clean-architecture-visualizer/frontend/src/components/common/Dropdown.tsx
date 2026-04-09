import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export interface DropdownOption {
    key: string;
    label: string;
    to: string;
    disabled?: boolean;
}

interface DropdownProps {
    options: DropdownOption[];
    onSelect: (option: DropdownOption) => void;
}

export default function Dropdown({ options, onSelect }: DropdownProps) {
    const location = useLocation();
    const { t } = useTranslation('common');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [selectedOptionLabel, setSelectedOptionLabel] = React.useState<string | null>(null);
    const isOpen = Boolean(anchorEl);
    const responsiveWidth = {
        xs: '68vw',
        sm: '52vw',
        md: '44vw',
        lg: '36vw',
    };

    const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOptionClick = (option: DropdownOption) => {
        setSelectedOptionLabel(option.label);
        onSelect(option);
        handleClose();
    };

    const currentPageLabel = React.useMemo(() => {
        if (location.pathname === '/') {
            return t('navigation.pages.home');
        }

        const matchedOption = options.find((option) => option.to === location.pathname);
        return matchedOption?.label ?? t('navigation.pages.currentPage');
    }, [location.pathname, options, t]);

    const switchableOptions = React.useMemo(
        () => options.filter((option) => option.to !== location.pathname),
        [location.pathname, options]
    );

    return (
        <>
            <Button
                variant="outlined"
                onClick={handleButtonClick}
                endIcon={<KeyboardArrowDownIcon />}
                aria-haspopup="menu"
                aria-expanded={isOpen ? 'true' : undefined}
                aria-controls={isOpen ? 'header-navigation-menu' : undefined}
                sx={{
                    textTransform: 'none',
                    width: responsiveWidth,
                    minWidth: 260,
                    maxWidth: 560,
                    justifyContent: 'space-between',
                    color: 'text.primary',
                    borderColor: 'text.primary',
                    '& .MuiButton-endIcon': {
                        color: 'text.primary',
                    },
                    '&:hover': {
                        borderColor: 'text.primary',
                        backgroundColor: 'action.hover',
                    },
                }}
            >
                {selectedOptionLabel || currentPageLabel}
            </Button>

            <Menu
                id="header-navigation-menu"
                anchorEl={anchorEl}
                open={isOpen}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                slotProps={{
                    paper: {
                        sx: {
                            width: responsiveWidth,
                            minWidth: 260,
                            maxWidth: 560,
                        },
                    },
                }}
            >
                {switchableOptions.map((option) => (
                    <MenuItem
                        key={option.key}
                        onClick={() => handleOptionClick(option)}
                        disabled={option.disabled}
                        sx={{ whiteSpace: 'normal' }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}