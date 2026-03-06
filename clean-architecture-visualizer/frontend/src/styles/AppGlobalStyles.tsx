import { GlobalStyles } from '@mui/material';

export const AppGlobalStyles = () => (
  <GlobalStyles styles={(theme) => ({
    body: {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: theme.typography.fontFamily,
    },
    
    // Centralized Monaco Editor highlights (theme-aware)
    '.violation-highlight': {
      backgroundColor: `${theme.palette.error.main}33`,
      borderBottom: `1px dotted ${theme.palette.error.main}`,
    },
    '.relation-highlight-instantiation': {
      backgroundColor: `${theme.palette.primary.main}33`,
      borderLeft: `4px solid ${theme.palette.primary.main}`,
    },
    '.relation-highlight-call': {
      backgroundColor: `${theme.palette.success.light}33`,
      borderLeft: `4px solid ${theme.palette.success.main}`,
    },
  })} />
);