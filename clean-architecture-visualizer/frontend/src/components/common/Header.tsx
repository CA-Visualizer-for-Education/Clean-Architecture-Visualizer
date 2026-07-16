import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import Dropdown, { DropdownOption } from './Dropdown.tsx';
import { Box, Paper } from '@mui/material';
import { useAnalysisSummary } from '../../actions/useAnalysis.ts';
import { Interaction, UseCase } from '../../lib/types.ts';

type HeaderProps = {
  actions?: ReactNode;
};

export default function Header({ actions }: HeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { data, isLoading } = useAnalysisSummary();

  const navigationOptions: DropdownOption[] = [
    ...(isLoading
      ? [
          {
            key: 'loading-interactions',
            label: t('navigation.status.loadingInteractions'),
            to: '',
            disabled: true,
          },
        ]
      : []),
    ...(data?.use_cases ?? []).flatMap((useCase: UseCase) =>
      (useCase.interactions ?? []).map((interaction: Interaction) => ({
        key: `interaction-${interaction.interaction_id}`,
        label: `${useCase.name}: ${interaction.interaction_name}`,
        to: `/use-case/${useCase.id}/interaction/${interaction.interaction_id}/diagram`,
      }))
    ),
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
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
            }}
          >
            {actions}
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <Dropdown options={navigationOptions} onSelect={handleNavigation} />
          </Box>
        </Box>
      </Paper>
    </header>
  );
}
