import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../test-utils';
import { ThemeProvider } from '@mui/material/styles';
import UseCaseInteractionDiagram from '@/pages/UseCaseInteractionDiagram';
import { lightTheme } from '@/lib';
import type { Violation } from '@/lib/types';
import { USE_CASE_SIDEBAR_OPEN_STORAGE_KEY } from '@/lib/storageKeys';

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
const mockUseInteractionViolations = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => mockUseParams(),
    };
});

vi.mock('../../../src/actions/useAnalysis.ts', async () => {
  const actual = await vi.importActual<typeof import('../../../src/actions/useAnalysis.ts')>('../../../src/actions/useAnalysis.ts');
  return {
    ...actual,
    useInteractionViolations: (interactionId: string) => mockUseInteractionViolations(interactionId),
  };
});

vi.mock('../../../src/components/diagram/CADiagram.tsx', () => ({
    CADiagram: ({ onNodeClick }: { onNodeClick?: (info: any) => void }) => (
        <button
            data-testid="mock-diagram"
            onClick={() =>
                onNodeClick?.({
                    id: 'controller-learning',
                    title: 'Controller',
                    type: 'Controller',
                    layer: 'InterfaceAdapters',
                  filePath: 'src/main/java/app/Controller.java',
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

describe('UseCaseInteractionDiagram page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    window.localStorage.removeItem(USE_CASE_SIDEBAR_OPEN_STORAGE_KEY);
    mockUseInteractionViolations.mockReset();
    mockUseInteractionViolations.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseParams.mockReturnValue({ useCaseId: 'uc-2', interactionId: 'uc2in1' });
  });

  const renderWithTheme = () =>
    render(
      <ThemeProvider theme={lightTheme}>
        <UseCaseInteractionDiagram />
      </ThemeProvider>
    );

  it('renders the header home link, dropdown, and link to code view, plus diagram/legend with sidebar open by default', () => {
    renderWithTheme();

    expect(screen.getByRole('link', { name: 'branding.name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /navigation\.pages\./ })).toBeInTheDocument();
    expect(screen.getByTestId('mock-diagram')).toBeInTheDocument();
    expect(screen.getByTestId('mock-legend')).toBeInTheDocument();
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    expect(screen.queryByLabelText('Expand sidebar')).not.toBeInTheDocument();
    expect(screen.queryByText('actions.viewUseCaseInteractionCode')).toBeInTheDocument();
    
  });

  it('shows an empty sidebar state when there are no issues', () => {
    renderWithTheme();

    expect(screen.getByText('emptyState')).toBeInTheDocument();
  });

  it('shows violations when issues are present', () => {
    const violations: Violation[] = [
      {
        id: 'v-1',
        type: 'DependencyRuleViolation',
        message: 'Controller depends on framework type directly',
        suggestion: 'Depend on an interface adapter boundary instead',
        related_node_ids: ['controller-learning'],
      },
    ];
    mockUseInteractionViolations.mockReturnValue({
      data: violations,
      isLoading: false,
      isError: false,
    });

    renderWithTheme();

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('Controller depends on framework type directly')).toBeInTheDocument();
    expect(screen.getByText('Depend on an interface adapter boundary instead')).toBeInTheDocument();
  });

  it('shows an error message when violations cannot be loaded', () => {
    mockUseInteractionViolations.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithTheme();

    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('shows loading while violations are being fetched', () => {
    mockUseInteractionViolations.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithTheme();

    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  it('shows a prompt when no interaction is selected', () => {
    mockUseParams.mockReturnValue({ useCaseId: 'uc-2' });

    renderWithTheme();

    expect(screen.getByText('selectInteraction')).toBeInTheDocument();
  });

  it('navigates to the code view when the "View Code" link is clicked', () => {
    renderWithTheme();

    fireEvent.click(screen.getByText('actions.viewUseCaseInteractionCode'));
    expect(mockNavigate).toHaveBeenCalledWith('/use-case/uc-2/interaction/uc2in1/code');
  });

  it('falls back to the generic code route when route params are missing', () => {
    mockUseParams.mockReturnValue({});
    renderWithTheme();

    fireEvent.click(screen.getByText('actions.viewUseCaseInteractionCode'));
    expect(mockNavigate).toHaveBeenCalledWith('/use-case-interaction-code');
  });

  it('navigates to the code view with file query when a node is clicked', () => {
    renderWithTheme();

    fireEvent.click(screen.getByTestId('mock-diagram'));
    expect(mockNavigate).toHaveBeenCalledWith('/use-case/uc-2/interaction/uc2in1/code?file=src%2Fmain%2Fjava%2Fapp%2FController.java');
  });

  it('does not navigate on node click when route params are missing', () => {
    mockUseParams.mockReturnValue({});
    renderWithTheme();

    fireEvent.click(screen.getByTestId('mock-diagram'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('closes the sidebar when the close button is clicked', () => {
    renderWithTheme();

    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Collapse sidebar'));
    expect(screen.queryByLabelText('Collapse sidebar')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
  });
  
  it('opens the sidebar when the open button is clicked', () => {
    renderWithTheme(); 
    fireEvent.click(screen.getByLabelText('Collapse sidebar'));
    expect(screen.queryByLabelText('Collapse sidebar')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Expand sidebar'));
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
  });

  it('persists the closed sidebar state across remounts', () => {
    const { unmount } = renderWithTheme();

    fireEvent.click(screen.getByLabelText('Collapse sidebar'));
    expect(screen.queryByLabelText('Collapse sidebar')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
    expect(window.localStorage.getItem(USE_CASE_SIDEBAR_OPEN_STORAGE_KEY)).toBe('false');

    unmount();
    renderWithTheme();

    expect(screen.queryByLabelText('Collapse sidebar')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
  });
});
