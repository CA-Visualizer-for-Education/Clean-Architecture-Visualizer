import React from 'react';
import '../i18n/config';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Container, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import HomeButtonGrid from '../components/common/HomeButtonGrid';
import InfoDialog from '../components/common/InfoDialog';

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
            {/* Info card */}
            <IconButton 
                sx={{ position: 'absolute', top: 20, right: 20 }} 
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
                content={t('infoDialog.content')}
                buttonText={t('infoDialog.button')}
            />

            <Box mb={12} textAlign="center">
                <Typography 
                    variant="h3" 
                    component="h1" 
                    fontWeight="800"
                    sx={{ whiteSpace: 'pre-line' }}
                >
                    {t('title')}
                </Typography>
            </Box>

            {/* Reusable Grid Component for Nav Cards */}
            <HomeButtonGrid items={navItems} />
        </Container>
    );
};

export default Home;