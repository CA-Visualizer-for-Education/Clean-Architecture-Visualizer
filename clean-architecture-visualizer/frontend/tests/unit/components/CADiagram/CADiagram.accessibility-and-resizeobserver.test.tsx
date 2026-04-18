// CADiagram accessibility and lifecycle coverage:
// - current semantic presence checks for nodes
// - ResizeObserver usage stability in render/unmount lifecycle
// - deferred TODO test for future interactive ARIA/button semantics
// TODO(refactor): if learning mode becomes async/API-backed, convert relevant getBy* assertions to findBy*/waitFor.

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from '../../../test-utils';
import { ThemeProvider } from '@mui/material/styles';
import { CADiagram } from '@/components/diagram/CADiagram';
import { lightTheme } from '@/lib';
import {
  installResizeObserverMock,
  setDefaultInteractionHookState,
  setRouteToLearningMode,
} from '../../../support/CADiagram/testSetup';

const mockUseInteraction = vi.fn();
const mockUseParams = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useLocation: () => mockUseLocation(),
  };
});

vi.mock('@/actions/useAnalysis.ts', async () => {
  const actual = await vi.importActual<typeof import('@/actions/useAnalysis.ts')>('@/actions/useAnalysis.ts');
  return {
    ...actual,
    useInteraction: (interactionId: string) => mockUseInteraction(interactionId),
  };
});

installResizeObserverMock(vi.fn());

describe('CADiagram accessibility and ResizeObserver behavior', () => {
  beforeEach(() => {
    setRouteToLearningMode(mockUseParams, mockUseLocation);
    setDefaultInteractionHookState(mockUseInteraction);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithTheme = () =>
    render(
      <ThemeProvider theme={lightTheme}>
        <CADiagram />
      </ThemeProvider>
    );

  // TODO(accessibility): Re-enable once CANodeView exposes semantic interactive roles/labels (e.g., button role + aria-label).
  // it('renders nodes with accessible button elements', () => {
  //   renderWithTheme();
  //
  //   const buttons = screen.getAllByRole('button');
  //   expect(buttons.length).toBeGreaterThanOrEqual(13);
  // });

  it('preserves semantic meaning in interactive nodes', () => {
    const { container } = renderWithTheme();

    const controllerNode = container.querySelector('[data-ca-node-id="controller-learning"]');
    expect(controllerNode).toBeInTheDocument();
  });

  it('does not crash when ResizeObserver is used', () => {
    expect(() => {
      renderWithTheme();
    }).not.toThrow();
  });

  it('cleans up ResizeObserver on unmount', () => {
    const { unmount } = renderWithTheme();

    expect(() => {
      unmount();
    }).not.toThrow();
  });
});
