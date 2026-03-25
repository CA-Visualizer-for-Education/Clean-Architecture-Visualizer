import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppGlobalStyles } from './styles/AppGlobalStyles';
import Home from './pages/Home';
import LearningMode from './pages/LearningMode';
import CheckerMode from './pages/CheckerMode';
import ProjectStarter from './pages/ProjectStarter';
import UseCaseInteractionDiagram from './pages/UseCaseInteractionDiagram';
import UseCaseInteractionCode from './pages/UseCaseInteractionCode';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from './lib';


const App: React.FC = () => {
    return (
        <ThemeProvider theme={lightTheme}>
            <AppGlobalStyles />
        <Router>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/learning' element={<LearningMode />} />
                    <Route path='/checker' element={<CheckerMode />} />
                    <Route path='/project-starter' element={<ProjectStarter />} />
                    <Route path='/use-case/:useCaseId/interaction/:interactionId/diagram' element={<UseCaseInteractionDiagram />} />
                    <Route path='/use-case/:useCaseId/interaction/:interactionId/code' element={<UseCaseInteractionCode />} />
                </Routes>
            </Router>
        </ThemeProvider>
  );
}

export default App;
