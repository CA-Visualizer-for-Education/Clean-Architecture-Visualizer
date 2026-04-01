import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#CCE0FF',
            dark: '#1A73E8',
        },
        entities: {
            main: '#fbc02d',
            light: '#FFFDE7',
            dark: '#966C03',
            contrastText: '#212121',
        },
        useCases: {
            main: '#EA578D',
            light: '#FFEBEE',
            dark: '#880E4F',
            contrastText: '#212121',
        },
        adapters: {
            main: '#45A54A',
            light: '#E8F5E9',
            dark: '#1B5E20',
            contrastText: '#212121',
        },
        drivers: {
            main: '#0291E3',
            light: '#E1F5FE',
            dark: '#01579B',
            contrastText: '#212121',
        },
        text: {
            primary: '#212121',
            secondary: '#616161',
        },
        error: {
            main: '#E80000',
        },
        background: {
            default: '#FFFFFF',
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: "'Inter', sans-serif",

        code: {
            fontFamily: "Consolas, Monaco, 'Courier New', monospace",
            fontSize: '0.875rem',
        },
    },
    shape: {
        borderRadius: 4,
    },
});

