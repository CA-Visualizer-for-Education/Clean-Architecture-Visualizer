import { createTheme } from '@mui/material/styles';

/* For simplicity, the dark theme is currently just the default MUI dark mode. 
    Customization can be added later if desired. */


export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    entities: {
      main: '#fbc02d',
      light: '#5f4b00',
      dark: '#ffe082',
      contrastText: '#f5f5f5',
    },
    useCases: {
      main: '#EA578D',
      light: '#5f1f3a',
      dark: '#f8a9c4',
      contrastText: '#f5f5f5',
    },
    adapters: {
      main: '#45A54A',
      light: '#1f4a24',
      dark: '#9ad7a0',
      contrastText: '#f5f5f5',
    },
    drivers: {
      main: '#0291E3',
      light: '#0f3f5f',
      dark: '#8ad0f7',
      contrastText: '#f5f5f5',
    },
  }
});