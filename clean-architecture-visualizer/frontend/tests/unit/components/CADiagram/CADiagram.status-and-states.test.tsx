// CADiagram status and state coverage:
// - VALID, VIOLATION, and MISSING node pathways
// - edge status and edge-type input handling
// - loading, error, empty, and minimal-data interaction states
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

describe('CADiagram status and states', () => {
  beforeEach(() => {
    setRouteToInteractionDiagram(mockUseParams, mockUseLocation);
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

  it('renders nodes with VALID status normally', () => {
    setRouteToLearningMode(mockUseParams, mockUseLocation);

    renderWithTheme();

    expect(screen.getByText('Controller')).toBeInTheDocument();
  });

  it('renders nodes with VIOLATION status', () => {
    const nodes: CANode[] = [
      {
        id: 'controller-1',
        name: 'UserController',
        type: 'Controller',
        layer: 'InterfaceAdapters',
        status: 'VIOLATION',
      },
    ];

    mockUseInteraction.mockReturnValue({
      data: { interaction_name: 'CreateUser', nodes, edges: [] },
      isLoading: false,
      isError: false,
    });

    renderWithTheme();

    expect(screen.getByText('UserController')).toBeInTheDocument();
  });

  it('renders MISSING nodes with appropriate indicator', () => {
    const nodes: CANode[] = [
      {
        id: 'controller-1',
        name: 'UserController',
        type: 'Controller',
        layer: 'InterfaceAdapters',
        status: 'VALID',
      },
    ];

    mockUseInteraction.mockReturnValue({
      data: { interaction_name: 'CreateUser', nodes, edges: [] },
      isLoading: false,
      isError: false,
    });

    renderWithTheme();

    expect(screen.getByText('UserController')).toBeInTheDocument();
    expect(screen.getByText('Presenter (Missing)')).toBeInTheDocument();
  });

  it('renders edges with VALID status', () => {
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

  it('renders edges with VIOLATION status', () => {
    const nodes: CANode[] = [
      {
        id: 'controller-1',
        name: 'UserController',
        type: 'Controller',
        layer: 'InterfaceAdapters',
        status: 'VALID',
      },
      {
        id: 'view-1',
        name: 'UserView',
        type: 'View',
        layer: 'Frameworks',
        status: 'VALID',
      },
    ];
    const edges: CAEdge[] = [
      {
        id: 'edge-violation',
        source: 'controller-1',
        target: 'view-1',
        type: 'DEPENDENCY',
        status: 'VIOLATION',
      },
    ];

    mockUseInteraction.mockReturnValue({
      data: { interaction_name: 'CreateUser', nodes, edges },
      isLoading: false,
      isError: false,
    });

    renderWithTheme();

    expect(screen.getByText('UserController')).toBeInTheDocument();
    expect(screen.getByText('UserView')).toBeInTheDocument();
  });

  it('renders empty diagram when no nodes provided', () => {
    mockUseInteraction.mockReturnValue({
      data: { interaction_name: 'EmptyInteraction', nodes: [], edges: [] },
      isLoading: false,
      isError: false,
    });

    const { container } = renderWithTheme();

    expect(container.querySelectorAll('[data-ca-node-id]').length).toBe(13);
  });

  it('handles single node diagram', () => {
    const nodes: CANode[] = [
      {
        id: 'entity-1',
        name: 'User',
        type: 'Entity',
        layer: 'EnterpriseBusinessRules',
        status: 'VALID',
      },
    ];

    mockUseInteraction.mockReturnValue({
      data: { interaction_name: 'SingleNode', nodes, edges: [] },
      isLoading: false,
      isError: false,
    });

    renderWithTheme();

    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('shows loading state while data is being fetched', () => {
    mockUseInteraction.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithTheme();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when data fetch fails', () => {
    mockUseInteraction.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch interaction data'),
    });

    renderWithTheme();

    expect(screen.getByText('Failed to fetch interaction data')).toBeInTheDocument();
  });

  it('handles data with different edge types (DEPENDENCY, ASSOCIATION, INHERITANCE)', () => {
    const nodes: CANode[] = [
      {
        id: 'node1',
        name: 'Node1',
        type: 'Controller',
        layer: 'InterfaceAdapters',
        status: 'VALID',
      },
      {
        id: 'node2',
        name: 'Node2',
        type: 'Interactor',
        layer: 'ApplicationBusinessRules',
        status: 'VALID',
      },
      {
        id: 'node3',
        name: 'Node3',
        type: 'Entity',
        layer: 'EnterpriseBusinessRules',
        status: 'VALID',
      },
    ];
    const edges: CAEdge[] = [
      {
        id: 'dep-edge',
        source: 'node1',
        target: 'node2',
        type: 'DEPENDENCY',
        status: 'VALID',
      },
      {
        id: 'assoc-edge',
        source: 'node2',
        target: 'node3',
        type: 'ASSOCIATION',
        status: 'VALID',
      },
      {
        id: 'inherit-edge',
        source: 'node2',
        target: 'node3',
        type: 'INHERITANCE',
        status: 'VALID',
      },
    ];

    mockUseInteraction.mockReturnValue({
      data: { interaction_name: 'ComplexInteraction', nodes, edges },
      isLoading: false,
      isError: false,
    });

    renderWithTheme();

    expect(screen.getByText('Node1')).toBeInTheDocument();
    expect(screen.getByText('Node2')).toBeInTheDocument();
    expect(screen.getByText('Node3')).toBeInTheDocument();
  });
});
