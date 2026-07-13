import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function TestYourself() {
  const { t } = useTranslation('common');

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {t('testYourselfPage.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('testYourselfPage.description')}
        </Typography>
      </Box>
    </Container>
  );
}
