import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Box, Typography, Container, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import HomeButtonGrid from '../components/common/HomeButtonGrid';
import InfoDialog from '../components/common/InfoDialog';
import CaveLogo from '../assets/locales/logo_dark.svg';

const Home = () => {
    const { t } = useTranslation('home');
    const [infoOpen, setInfoOpen] = React.useState(false);

    // Define the navigation data for the grid
    const navItems = [
        {
            title: t('cards.checker.title'),
            description: t('cards.checker.description'),
            to: "/checker",
            icon: <CheckCircleOutlineIcon />,
            bgColor: "adapters.main"
        },
        {
            title: t('cards.learn.title'),
            description: t('cards.learn.description'),
            to: "/learning",
            icon: <MenuBookIcon />,
            bgColor: "drivers.main"
        },
        {
            title: t('cards.starter.title'),
            description: t('cards.starter.description'),
            to: "/project-starter",
            icon: <AssignmentOutlinedIcon />,
            bgColor: "useCases.light",
            iconColor: "useCases.dark"
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 10, position: 'relative' }}>
            <Box mb={12} display="flex" justifyContent="center" alignItems="center" gap={3}>
                <Box 
                    component="img"
                    src={CaveLogo}
                    alt="CAVE Logo"
                    sx={{ height: 60 }} 
                />
                <Typography 
                    variant="h3" 
                    component="h1" 
                    fontWeight="800"
                >
                    {t('title')}
                </Typography>
            </Box>

            {/* Info card */}
            <IconButton 
                sx={{ position: 'fixed', bottom: 20, right: 30 }} 
                onClick={() => setInfoOpen(true)}
                aria-label={t('infoDialog.title')}
                title={t('infoDialog.title')}
            >
                <InfoOutlinedIcon fontSize="large" />
            </IconButton>

            <InfoDialog 
                open={infoOpen} 
                onClose={() => setInfoOpen(false)}
                title={t('infoDialog.title')}
                buttonText={t('infoDialog.button')}
                content={
                    <Trans 
                        i18nKey="infoDialog.content" 
                        t={t} 
                        components={{ br: <br />, strong: <strong /> }} 
                    />
                }
            />

            {/* Reusable Grid Component for Nav Cards */}
            <HomeButtonGrid items={navItems} />
        </Container>
    );
};

export default Home;