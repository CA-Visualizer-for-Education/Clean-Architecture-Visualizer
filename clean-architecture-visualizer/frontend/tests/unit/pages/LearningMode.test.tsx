import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../test-utils';
import { ThemeProvider } from '@mui/material/styles';
import LearningMode from '@/pages/LearningMode';
import { lightTheme } from '@/lib';
import type { NodeClickInfo } from '@/components/diagram/CANodeView';

vi.mock('../../../src/components/diagram/CADiagram.tsx', () => ({
  CADiagram: ({ onNodeClick }: { onNodeClick?: (info: NodeClickInfo) => void }) => (
    <button
      data-testid="mock-diagram"
      onClick={() =>
        onNodeClick?.({
          id: 'controller-learning',
          title: 'Controller',
          type: 'Controller',
          layer: 'InterfaceAdapters',
        })
      }
    >
      mock diagram
    </button>
  ),
}));

vi.mock('../../../src/components/diagram/Legend/index.tsx', () => ({
  Legend: () => <div data-testid="mock-legend" />,
}));

describe('LearningMode page', () => {
  const renderWithTheme = () =>
    render(
      <ThemeProvider theme={lightTheme}>
        <LearningMode />
      </ThemeProvider>
    );

  it('renders the header home link and dropdown, plus diagram/legend with sidebar closed by default', () => {
    renderWithTheme();

    expect(screen.getByRole('link', { name: 'branding.name' })).toBeInTheDocument();
    expect(screen.getByText('navigation.pages.home')).toBeInTheDocument();
    expect(screen.getByTestId('mock-diagram')).toBeInTheDocument();
    expect(screen.getByTestId('mock-legend')).toBeInTheDocument();
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
    expect(screen.queryByLabelText('Collapse sidebar')).not.toBeInTheDocument();
    expect(screen.queryByText('actions.viewUseCaseInteractionCode')).not.toBeInTheDocument();
    
  });

  it('opens the sidebar and shows the selected node description when a node is clicked', () => {
    renderWithTheme();

    expect(screen.queryByLabelText('Collapse sidebar')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-diagram'));

    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    expect(screen.getByText('components.controller.description')).toBeInTheDocument();
  });

  it('shows controller content when opening the sidebar without clicking a node', () => {
    renderWithTheme();

    fireEvent.click(screen.getByLabelText('Expand sidebar'));

    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    expect(screen.getByText('components.controller.name')).toBeInTheDocument();
    expect(screen.getByText('components.controller.description')).toBeInTheDocument();
  });

  it('closes the sidebar when the close button is clicked', () => {
    renderWithTheme();

    fireEvent.click(screen.getByTestId('mock-diagram'));

    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Collapse sidebar'));
    expect(screen.queryByLabelText('Collapse sidebar')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
  });
  

});
