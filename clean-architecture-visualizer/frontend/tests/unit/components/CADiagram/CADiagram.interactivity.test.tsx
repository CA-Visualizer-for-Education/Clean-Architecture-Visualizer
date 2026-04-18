// CADiagram interactivity coverage:
// - click handling on rendered nodes
// - onNodeClick callback invocation in learning and interaction contexts
// - callback payload shape for selected nodes
// TODO(refactor): if learning mode becomes async/API-backed, convert relevant getBy* assertions to findBy*/waitFor.

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render } from '../../../test-utils';
import { ThemeProvider } from '@mui/material/styles';
import { CADiagram } from '@/components/diagram/CADiagram';
import { lightTheme } from '@/lib';
import type { CANode } from '@/lib/types';
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

describe('CADiagram interactivity', () => {
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

  it('calls onNodeClick callback when a node is clicked', () => {
    const onNodeClick = vi.fn();
    setRouteToLearningMode(mockUseParams, mockUseLocation);

    renderWithTheme({ onNodeClick });

    const controllerNode = document.querySelector('[data-ca-node-id="controller-learning"]');
    expect(controllerNode).toBeInTheDocument();
    fireEvent.click(controllerNode as Element);

    expect(onNodeClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'controller-learning',
        title: 'Controller',
        type: 'Controller',
        layer: 'InterfaceAdapters',
      })
    );
  });

  it('makes nodes interactive in learning mode', () => {
    const onNodeClick = vi.fn();
    setRouteToLearningMode(mockUseParams, mockUseLocation);

    renderWithTheme({ onNodeClick });

    const controllerNode = document.querySelector('[data-ca-node-id="controller-learning"]');
    expect(controllerNode).toBeInTheDocument();
    fireEvent.click(controllerNode as Element);
    expect(onNodeClick).toHaveBeenCalled();
  });

  it('makes nodes interactive when onNodeClick callback is provided', () => {
    const onNodeClick = vi.fn();
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

    renderWithTheme({ onNodeClick });

    const controllerNode = document.querySelector('[data-ca-node-id="controller-1"]');
    expect(controllerNode).toBeInTheDocument();
    fireEvent.click(controllerNode as Element);
    expect(onNodeClick).toHaveBeenCalled();
  });

  it('passes correct node data in onNodeClick callback', () => {
    const onNodeClick = vi.fn();
    setRouteToLearningMode(mockUseParams, mockUseLocation);

    renderWithTheme({ onNodeClick });

    const inputBoundaryNode = document.querySelector('[data-ca-node-id="inputboundary-learning"]');
    expect(inputBoundaryNode).toBeInTheDocument();
    fireEvent.click(inputBoundaryNode as Element);

    expect(onNodeClick).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'InputBoundary',
        layer: 'ApplicationBusinessRules',
      })
    );
  });
});
