// CADiagram rendering coverage:
// - learning mode static node rendering
// - interaction mode data-driven node rendering
// - layer section headings and node presence by data-ca-node-id
// TODO(refactor): if learning mode becomes async/API-backed, convert relevant getBy* assertions to findBy*/waitFor.

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../../../test-utils';
import { ThemeProvider } from '@mui/material/styles';
import { CADiagram } from '@/components/diagram/CADiagram';
import { lightTheme } from '@/lib';
import type { CANode, CAEdge } from '@/lib/types';
import {
  installResizeObserverMock,
  setDefaultInteractionHookState,
  setRouteToInteractionDiagram,
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

describe('CADiagram rendering', () => {
  beforeEach(() => {
    setRouteToInteractionDiagram(mockUseParams, mockUseLocation);
    setDefaultInteractionHookState(mockUseInteraction);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithTheme = (props = {}) =>
    render(
      <ThemeProvider theme={lightTheme}>
        <CADiagram {...props} />
      </ThemeProvider>
    );

  it('renders all 13 component nodes in learning mode', () => {
    setRouteToLearningMode(mockUseParams, mockUseLocation);

    const { container } = renderWithTheme();

    const expectedNodeIds = [
      'controller-learning',
      'presenter-learning',
      'viewmodel-learning',
      'inputdata-learning',
      'inputboundary-learning',
      'interactor-learning',
      'outputboundary-learning',
      'outputdata-learning',
      'dataaccessinterface-learning',
      'entities-learning',
      'view-learning',
      'dataaccess-learning',
      'database-learning',
    ];
    expectedNodeIds.forEach((id) => {
      expect(container.querySelector(`[data-ca-node-id="${id}"]`)).toBeInTheDocument();
    });

    // Keep a few representative labels to ensure user-facing names still render.
    expect(screen.getByText('Controller')).toBeInTheDocument();
    expect(screen.getByText('Use Case Interactor')).toBeInTheDocument();
    expect(screen.getByText('Entities')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-ca-node-id]').length).toBe(13);
  });

  it('renders nodes from interaction data when provided', () => {
    const nodes: CANode[] = [
      {
        id: 'controller-1',
        name: 'UserController',
        type: 'Controller',
        layer: 'InterfaceAdapters',
        status: 'VALID',
      },
      {
        id: 'interactor-1',
        name: 'CreateUserInteractor',
        type: 'Interactor',
        layer: 'ApplicationBusinessRules',
        status: 'VALID',
      },
    ];
    const edges: CAEdge[] = [
      {
        id: 'edge-1',
        source: 'controller-1',
        target: 'interactor-1',
        type: 'DEPENDENCY',
        status: 'VALID',
      },
    ];

    mockUseInteraction.mockReturnValue({
      data: { interaction_name: 'CreateUser', nodes, edges },
      isLoading: false,
      isError: false,
    });

    renderWithTheme();

    expect(screen.getByText('UserController')).toBeInTheDocument();
    expect(screen.getByText('CreateUserInteractor')).toBeInTheDocument();
  });

  it('renders nodes grouped by layer', () => {
    setRouteToLearningMode(mockUseParams, mockUseLocation);

    const { container } = renderWithTheme();

    expect(screen.getByText('Interface Adapters')).toBeInTheDocument();
    expect(screen.getByText('Application Business Rules')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Business Rules')).toBeInTheDocument();
    expect(screen.getByText('Frameworks and Drivers')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-ca-node-id]').length).toBe(13);
  });

  it('renders different component types', () => {
    setRouteToLearningMode(mockUseParams, mockUseLocation);

    renderWithTheme();

    expect(screen.getByText('Controller')).toBeInTheDocument();
    expect(screen.getByText('Entities')).toBeInTheDocument();
  });
});
