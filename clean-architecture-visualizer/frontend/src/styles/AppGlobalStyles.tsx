import { GlobalStyles } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const AppGlobalStyles = () => (
  <GlobalStyles
     styles={(theme) => {
      const entitiesMain = theme.palette.entities?.main ?? theme.palette.primary.main;
      const useCasesMain = theme.palette.useCases?.main ?? theme.palette.primary.main;
      const adaptersMain = theme.palette.adapters?.main ?? theme.palette.primary.main;
      const driversMain = theme.palette.drivers?.main ?? theme.palette.primary.main;
       return {
         '.monaco-editor .violation-highlight': {
           backgroundColor: `${alpha(theme.palette.error.main, 0.2)} !important`,
           borderBottom: `2px dotted ${theme.palette.error.main} !important`,
         },
         '.monaco-editor .relation-highlight-entities': {
           backgroundColor: `${alpha(entitiesMain, 0.2)} !important`,
           borderLeft: `4px solid ${entitiesMain} !important`,
         },
         '.monaco-editor .relation-highlight-useCases': {
           backgroundColor: `${alpha(useCasesMain, 0.2)} !important`,
           borderLeft: `4px solid ${useCasesMain} !important`,
         },
         '.monaco-editor .relation-highlight-adapters': {
           backgroundColor: `${alpha(adaptersMain, 0.2)} !important`,
           borderLeft: `4px solid ${adaptersMain} !important`,
         },
         '.monaco-editor .relation-highlight-drivers': {
           backgroundColor: `${alpha(driversMain, 0.2)} !important`,
           borderLeft: `4px solid ${driversMain} !important`,
         },
         '.monaco-editor .relation-highlight-default': {
           backgroundColor: `${alpha(theme.palette.primary.main, 0.1)} !important`,
           borderLeft: `4px solid ${theme.palette.primary.main} !important`,
         },
       };
     }}
   />
);