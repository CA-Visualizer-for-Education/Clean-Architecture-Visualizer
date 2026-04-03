import { SxProps, Theme } from '@mui/material/styles';
import { CSSProperties } from 'react';

export const styles = {
    container: (theme: Theme): SxProps<Theme> => ({
        maxWidth: 1200,
        margin: '0 auto',
        padding: '40px 16px',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: theme.palette.background.default,
    }),
    title: (theme: Theme): SxProps<Theme> => ({
        textAlign: 'center',
        fontSize: { xs: 32, md: 40 }, 
        fontWeight: 700,          
        margin: '16px 0 24px',
        color: theme.palette.text.primary,
    }),
    statusRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        justifyContent: 'center',
        '& svg': { fontSize: 32 } 
    },
    searchContainer: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        mt: 2
    },
    searchInput: {
        mb: 3,
        width: '100%',
        maxWidth: 600,
        '& .MuiOutlinedInput-root': {
            borderRadius: 8, 
        },
    },
    accordion: {
        mb: 2,
        borderRadius: 2,
        width: '100%',
        maxWidth: 600,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        '&:before': { display: 'none' },
    },
    link: (theme: Theme): CSSProperties => ({ 
        textDecoration: 'underline',
        color: theme.palette.primary.dark,
        fontSize: '17px',
        fontWeight: 500,
    }),
};