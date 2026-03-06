import { GlobalStyles } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const AppGlobalStyles = () => (
  <GlobalStyles styles={(theme) => ({
    // Centralized Monaco Editor highlights (theme-aware)
    '.monaco-editor .violation-highlight': {
      backgroundColor: alpha(theme.palette.error.main, 0.2),
      borderBottom: `1px dotted ${theme.palette.error.main}`,
    },
    '.monaco-editor .relation-highlight-instantiation': {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
      borderLeft: `4px solid ${theme.palette.primary.main}`,
    },
    '.monaco-editor .relation-highlight-call': {
      backgroundColor: alpha(theme.palette.success.light, 0.2),
      borderLeft: `4px solid ${theme.palette.success.main}`,
    },
  })} />
);