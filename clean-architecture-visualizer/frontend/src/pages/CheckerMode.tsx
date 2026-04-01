import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n/config';
import { Link } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { HomeIcon, InfoIcon, CheckCircleIcon, ErrorIcon } from '../assets/icons';
import { useAnalysisSummary } from '../actions/useAnalysis';
import { UseCase, Interaction } from '../lib/types';

export default function CheckerMode(){
    const { t } = useTranslation('checker');
    const [search, setSearch] = useState('');

    const { data, isLoading, isError } = useAnalysisSummary();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="inherit" />
            </div>
        );
    }

    if (isError || !data) {
        return <div style={{ textAlign: 'center', marginTop: 50 }}>Error loading analysis data.</div>;
    }
    const filteredUseCases = data.use_cases
        .map((uc: UseCase) => ({
            ...uc,
            interactions: (uc.interactions || []).filter((i: Interaction) =>
                i.interaction_name.toLowerCase().includes(search.toLowerCase())
            ),
        }))
        .filter(
            (uc) =>
                uc.name.toLowerCase().includes(search.toLowerCase()) ||
                uc.interactions.length > 0 ||
                search === ''
        );
    return (
        <div
            style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '40px 16px',
                width: '100%',
                boxSizing: 'border-box',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <HomeIcon style={{ width: 32, height: 32, verticalAlign: 'middle', color: '#222' }} />
                </Link>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Info">
                    <InfoIcon style={{ width: 28, height: 28, verticalAlign: 'middle', color: '#222' }} />
                </button>
            </div>

            <h1 style={{ textAlign: 'center', fontSize: 40, margin: '16px 0 24px' }}>
                {data.project_name || t('title')}
            </h1>

            {/* Use the counts from the API response */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center', marginBottom: 8 }}>
                <CheckCircleIcon style={{ width: 28, height: 28, fill: '#4caf50', verticalAlign: 'middle' }} />
                <span style={{ fontWeight: 600, fontSize: 26, color: '#555' }}>
                    {t('useCasesDetected', { count: data.total_use_cases })}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center', marginBottom: 24 }}>
                <ErrorIcon style={{ width: 28, height: 28, fill: '#e65100', verticalAlign: 'middle' }} />
                <span style={{ fontWeight: 700, fontSize: 26, color: '#e65100' }}>
                    {t('violationsPresent', { count: data.total_violations })}
                </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    variant="outlined"
                    sx={{ mb: 3, borderRadius: 3, width: '100%', maxWidth: 600 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        style: { borderRadius: 24 }
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {filteredUseCases.map((useCase: UseCase) => (
                    <Accordion
                        key={useCase.id}
                        sx={{ mb: 2, borderRadius: 2, width: '100%', maxWidth: 600 }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`${useCase.name}-content`}
                            id={`${useCase.name}-header`}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingRight: 16 }}>
                                <span style={{ fontWeight: 600, fontSize: 20 }}>{useCase.name}</span>
                                {useCase.violation_count > 0 && (
                                    <span style={{ color: '#e65100', fontWeight: 700, fontSize: 14 }}>
                                        {t('violationsPresent', { count: useCase.violation_count })}
                                    </span>
                                )}
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            {(useCase.interactions ?? []).length === 0 ? (
                                <span style={{ color: '#888', fontStyle: 'italic' }}>{t('noInteractions')}</span>
                            ) : (
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {(useCase.interactions ?? []).map((interaction: Interaction) => (
                                        <li key={interaction.interaction_id} style={{ margin: '8px 0' }}>
                                            <Link
                                                to={`/use-case/${useCase.id}/interaction/${interaction.interaction_id}/diagram`}
                                                style={{ textDecoration: 'underline', color: '#1976d2', fontSize: 17 }}
                                            >
                                                {interaction.interaction_name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
        </div>
    );
}