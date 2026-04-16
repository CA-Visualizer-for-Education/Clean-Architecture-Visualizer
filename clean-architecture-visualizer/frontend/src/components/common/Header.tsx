import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import Dropdown, { DropdownOption } from './Dropdown.tsx';
import { Box, Paper, Typography } from '@mui/material';
import { HomeIcon } from '../../assets/icons';
import { useAnalysisSummary } from '../../actions/useAnalysis.ts';
import { Interaction, UseCase } from '../../lib/types.ts';

type HeaderProps = {
    actions?: ReactNode;
};

export default function Header({ actions }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation('common');
    const { data, isLoading } = useAnalysisSummary();

    // Detect if we're on a code view route
    const isCodeView = location.pathname.includes('/code');

    const navigationOptions: DropdownOption[] = [
        ...(isCodeView ? [] : [{ key: 'learning-mode', label: t('navigation.pages.learningMode'), to: '/learning' }]),
        ...(isLoading
            ? [{ key: 'loading-interactions', label: t('navigation.status.loadingInteractions'), to: '', disabled: true }]
            : []),
        ...((data?.use_cases ?? []).flatMap((useCase: UseCase) =>
            (useCase.interactions ?? []).map((interaction: Interaction) => ({
                key: `interaction-${interaction.interaction_id}`,
                label: `${useCase.name}: ${interaction.interaction_name}`,
                to: `/use-case/${useCase.id}/interaction/${interaction.interaction_id}/${isCodeView ? 'code' : 'diagram'}`,
            }))
        )),
    ];

    const handleNavigation = (option: DropdownOption) => {
        if (option.disabled) {
            return;
        }

        navigate(option.to);
    };

    return (
        <header>
            <Paper
                elevation={3}
                sx={{
                    backgroundColor: 'background.paper',
                    position: 'relative',
                    zIndex: (theme) => theme.zIndex.appBar,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: 77, // Ensure consistent height even if actions are empty
                        p: 2,
                        gap: 0,
                    }}
                >
                    {/* Home Link */}
                    <Box component={Link} to="/" sx={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                        <Box sx={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center'}}>
                            <HomeIcon style={{ width: '100%', height: '100%', verticalAlign: 'middle' }} />
                        </Box>
                        <Typography variant="h6" component="span" sx={{ marginLeft: 1, color: 'text.primary' }}>
                            {t('branding.name')}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        {actions}
                    </Box>

                    <Box>
                        <Dropdown options={navigationOptions} onSelect={handleNavigation} />
                    </Box>
                </Box>
                
            </Paper>
        </header>
    );
}