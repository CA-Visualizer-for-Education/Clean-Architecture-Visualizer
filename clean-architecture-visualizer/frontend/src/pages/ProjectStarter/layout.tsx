import { styled } from '@mui/material/styles';
import { Box, Typography, Button, Container, TextField } from '@mui/material';

export const PageWrapper = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
}));

export const Section = styled(Box)({
  textAlign: 'left',
});

export const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

export const Description = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(4),
  fontWeight: 400,
}));

export const ActionCenter = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
});

export const DarkButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.text.primary,
  color: theme.palette.background.paper,
  textTransform: 'none',
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  paddingTop: theme.spacing(1.2),
  paddingBottom: theme.spacing(1.2),
  fontWeight: 600,
  '&:hover': {
    backgroundColor: theme.palette.text.secondary,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

export const InputContainer = styled(Box)(() => ({
  width: '100%',
  maxWidth: 450,
  margin: '0 auto',
}));

export const FieldLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: (theme.shape.borderRadius as number) * 2,
    backgroundColor: theme.palette.background.paper,

    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.text.primary, 
        borderWidth: '1px',
    },
  },
}));