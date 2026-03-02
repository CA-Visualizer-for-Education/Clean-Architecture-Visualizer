import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LearningMode from './pages/LearningMode';
import CheckerMode from './pages/CheckerMode';
import ProjectStarter from './pages/ProjectStarter';
import UseCaseInteractionDiagram from './pages/UseCaseInteractionDiagram';
import UseCaseInteractionCode from './pages/UseCaseInteractionCode';
import StylingGuideline from './pages/StylingGuideline';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/learning' element={<LearningMode />} />
                <Route path='/checker' element={<CheckerMode />} />
                <Route path='/project-starter' element={<ProjectStarter />} />
                <Route path='/use-case/:useCaseId/interaction/:interactionId/diagram' element={<UseCaseInteractionDiagram />} />
                <Route path='/use-case/:useCaseId/interaction/:interactionId/code' element={<UseCaseInteractionCode />} />
                <Route path='/styling-guideline' element={<StylingGuideline />} />
            </Routes>
        </Router>
    );
};

export default App;
