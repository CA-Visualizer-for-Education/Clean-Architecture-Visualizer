import { useState } from 'react';
import { Box, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../i18n/config'; 
import { useGenerateProject, useCreateUseCase } from '../../actions/useTemplate';
import {
  PageWrapper,
  Section,
  Title,
  Description,
  ActionCenter,
  DarkButton,
  InputContainer,
  FieldLabel,
  StyledTextField,
} from './layout';


const ProjectStarter = () => {
    const { t } = useTranslation("projectStarter");
    const [useCaseName, setUseCaseName] = useState('');
    
    // Snackbar State
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const { mutate: triggerGenerate, isPending: isGenerating } = useGenerateProject();
    const { mutate: triggerCreateUseCase, isPending: isCreating } = useCreateUseCase();

    const isWorking = isGenerating || isCreating;

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleCreateProject = () => {
        triggerGenerate(undefined, {
            onSuccess: () => {
                // Notifies the user that the base directories (app, entity, etc.) were created
                setSnackbar({ open: true, message: t('startNew.success') });
            },
            onError: (err) => console.error("Failed to create project", err)
        });
    };

    const handleAddUseCase = () => {
        const trimmedName = useCaseName.trim();
        if (!trimmedName) return;

        triggerCreateUseCase(trimmedName, {
            onSuccess: () => {
                setSnackbar({ 
                    open: true, 
                    message: t('addUseCase.success', { name: trimmedName }) 
                });
                setUseCaseName(''); 
            },
            onError: (err) => console.error("Failed to add use case", err)
        });
    };

    return (
        <PageWrapper maxWidth="md">
            <Box sx={{ mb: 4 }}>
                <IconButton 
                    component={Link} 
                    to="/" 
                    sx={{ color: 'text.primary', p: 0 }}
                    aria-label="Home"
                >
                    <HomeOutlinedIcon sx={{ fontSize: 48 }} />
                </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <Section sx={{ textAlign: 'center'}}>
                    <Title variant="h4">{t('startNew.title')}</Title>
                    <Description variant="h5">{t('startNew.description')}</Description>
                    <ActionCenter>
                        <DarkButton 
                            variant="contained" 
                            disabled={isWorking}
                            onClick={handleCreateProject}
                        >
                            {isGenerating ? t('startNew.loading') : t('startNew.button')}
                        </DarkButton>
                    </ActionCenter>
                </Section>

                <Divider sx={{ width: '100%' }}/>

                <Section sx={{ textAlign: 'center'}}>
                    <Title variant="h4">{t('addUseCase.title')}</Title>
                    <Description variant="h5">{t('addUseCase.description')}</Description>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <InputContainer>
                            <FieldLabel 
                                variant="body2" 
                                component="label" 
                                htmlFor="use-case-input"
                            >
                                {t('addUseCase.inputLabel')}
                            </FieldLabel>
                            <StyledTextField
                                id="use-case-input" 
                                fullWidth
                                size="small"
                                value={useCaseName}
                                onChange={(e) => setUseCaseName(e.target.value)}
                                placeholder={t('addUseCase.inputPlaceholder')}
                                disabled={isWorking}
                            />
                        </InputContainer>

                        <DarkButton 
                            variant="contained" 
                            disabled={isWorking || !useCaseName.trim()}
                            onClick={handleAddUseCase}
                        >
                            {isCreating ? t('addUseCase.loading') : t('addUseCase.button')}
                        </DarkButton>
                    </Box>
                </Section>
            </Box>

            {/* Success Popup */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity="success" 
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </PageWrapper>
    );
}

export default ProjectStarter;