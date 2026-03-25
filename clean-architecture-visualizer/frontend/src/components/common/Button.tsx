import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CtaButton = styled(Button)(({ theme }) => ({
  borderRadius: '24px',
  textTransform: 'none',
  padding: '4px 12px',
  fontSize: '0.8125rem', 
  fontWeight: 600,
  borderWidth: '1.5px',
  borderColor: theme.palette.divider,
  color: theme.palette.text.secondary,
  '&:hover': {
    borderWidth: '1.5px',
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.dark,
  },
  '& .MuiButton-startIcon': {
    marginRight: '4px',
  },
}));