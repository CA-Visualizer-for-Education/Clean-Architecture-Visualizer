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
import Navbar, { NAV_BAR_HEIGHT } from './components/layout/Navbar';

export default function App() {
  return (
    // When a theme toggle is implemented, we can use a state variable to switch between lightTheme and darkTheme here.
    <ThemeProvider theme={lightTheme}>
      <AppGlobalStyles />
      <Router>
        <Navbar />
        <div style={{ paddingTop: NAV_BAR_HEIGHT }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<LearningMode />} />
            <Route path="/checker" element={<CheckerMode />} />
            <Route path="/project-starter" element={<ProjectStarter />} />
            <Route
              path="/use-case/:useCaseId/interaction/:interactionId/diagram"
              element={<UseCaseInteractionDiagram />}
            />
            <Route
              path="/use-case/:useCaseId/interaction/:interactionId/code"
              element={<UseCaseInteractionCode />}
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}
