import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
    Accordion, AccordionSummary, AccordionDetails, 
    TextField, InputAdornment, CircularProgress, Box, Typography, useTheme, IconButton 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import '../../i18n/config'; 
import { useAnalysisSummary } from '../../actions/useAnalysis';
import { UseCase, Interaction } from '../../lib/types';
import { styles } from './styles';

const CheckerMode = () => {
    const theme = useTheme();
    const { t } = useTranslation('checker');
    const [search, setSearch] = useState('');
    const { data, isLoading, isError } = useAnalysisSummary();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !data) {
        return (
            <Typography sx={{ textAlign: 'center', mt: 6 }}>
                {t('errorLoading')}
            </Typography>
        );
    }

    const filteredUseCases = data.use_cases
        .map((uc: UseCase) => ({
            ...uc,
            interactions: (uc.interactions || []).filter((i: Interaction) =>
                i.interaction_name.toLowerCase().includes(search.toLowerCase())
            ),
        }))
        .filter(uc => uc.name.toLowerCase().includes(search.toLowerCase()) || uc.interactions.length > 0 || search === '');

    return (
        <Box sx={styles.container(theme)}>
            {/* Top Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <IconButton 
                    component={Link} 
                    to="/" 
                    color="inherit" 
                    aria-label={t('home')}
                >
                    <HomeIcon />
                </IconButton>
                <IconButton 
                    color="inherit" 
                    title={t('info')} 
                    aria-label={t('info')}
                >
                    <InfoOutlinedIcon />
                </IconButton>
            </Box>

            <Typography variant="h1" sx={styles.title(theme)}>
                {data.project_name || t('title')}
            </Typography>

            {/* Stats Section */}
            <Box sx={{ ...styles.statusRow, mb: 1 }}>
                <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                <Typography sx={{ fontWeight: 600, fontSize: 24, color: theme.palette.text.secondary }}>
                    {t('useCasesDetected', { count: data.total_use_cases })}
                </Typography>
            </Box>

            <Box sx={{ ...styles.statusRow, mb: 4 }}>
                <ErrorIcon sx={{ color: theme.palette.error.main }} />
                <Typography sx={{ fontWeight: 700, fontSize: 24, color: theme.palette.error.main }}>
                    {t('violationsPresent', { count: data.total_violations })}
                </Typography>
            </Box>

            {/* Search Bar */}
            <Box sx={styles.searchContainer}>
                <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    variant="outlined"
                    sx={styles.searchInput}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Use Case List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {filteredUseCases.map((useCase: UseCase) => {
                    const summaryId = `use-case-${useCase.id}-summary`;
                    const detailsId = `use-case-${useCase.id}-details`;
                    
                    return (
                        <Accordion key={useCase.id} sx={styles.accordion} disableGutters>
                            <AccordionSummary 
                                expandIcon={<ExpandMoreIcon />}
                                id={summaryId}
                                aria-controls={detailsId}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: 18 }}>{useCase.name}</Typography>
                                    {useCase.violation_count > 0 && (
                                        <Typography sx={{ color: theme.palette.error.main, fontWeight: 700, fontSize: 13 }}>
                                            {t('violationsPresent', { count: useCase.violation_count })}
                                        </Typography>
                                    )}
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails 
                                sx={{ pt: 0 }} 
                                id={detailsId}
                                aria-labelledby={summaryId}
                            >
                                {(!useCase.interactions || useCase.interactions.length === 0) ? (
                                    <Typography sx={{ color: theme.palette.text.disabled, fontStyle: 'italic', fontSize: 14 }}>
                                        {t('noInteractions')}
                                    </Typography>
                                ) : (
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {(useCase.interactions ?? []).map((interaction: Interaction) => (
                                            <li key={interaction.interaction_id} style={{ margin: '12px 0' }}>
                                                <Link 
                                                    to={`/use-case/${useCase.id}/interaction/${interaction.interaction_id}/diagram`}
                                                    style={styles.link(theme)} 
                                                >
                                                    {interaction.interaction_name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Box>
        </Box>
    );
};

export default CheckerMode;