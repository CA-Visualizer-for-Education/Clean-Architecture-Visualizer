import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppGlobalStyles } from './styles/AppGlobalStyles';
import Home from './pages/Home';
import CheckerMode from './pages/CheckerMode';
import ProjectStarter from './pages/ProjectStarter';
import UseCaseInteractionDiagram from './pages/UseCaseInteractionDiagram';
import AppLayout from './layouts/AppLayout';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from './lib';
import './i18n/config';

export default function App() {
  return (
    // When a theme toggle is implemented, we can use a state variable to switch between lightTheme and darkTheme here.
    <ThemeProvider theme={lightTheme}>
      <AppGlobalStyles />
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/checker" element={<CheckerMode />} />
            <Route path="/project-starter" element={<ProjectStarter />} />
            <Route
              path="/use-case/:useCaseId/interaction/:interactionId/diagram"
              element={<UseCaseInteractionDiagram />}
            />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
