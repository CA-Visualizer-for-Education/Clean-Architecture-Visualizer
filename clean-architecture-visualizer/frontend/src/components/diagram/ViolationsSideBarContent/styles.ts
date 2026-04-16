import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export const ViolationsRoot = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

export const ViolationsTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    color: theme.palette.error.main,
    textAlign: 'center',
}));

export const ViolationsList = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

export const ViolationType = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
}));

export const ViolationField = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    marginBottom: theme.spacing(1),
}));

export const ViolationFieldLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: theme.palette.text.secondary,
}));

export const ViolationValue = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
}));

export const ViolationFileContext = styled(ViolationValue)(({ theme }) => ({
    display: 'block',
    marginTop: theme.spacing(0.5),
}));

export const ViolationsContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
}));