// This file is responsible for rendering the Clean Architecture Diagram based on the data passed in as props.
// It is a pure presentational component that does not contain any logic for fetching data or handling loading/error states.

import { type NodeClickInfo } from './CANodeView';
import { ReactFlowNode, PanelNode, NODE_POSITIONS, BACKGROUND_PANELS } from './ReactFlowComponents/FlowNodes';
import { EdgeMarkerDefs, ObstacleAwareSmartEdge } from './ReactFlowComponents/FlowEdge';
//import { Edge, type EdgeRouteHint } from './Edge';
import { CANode, CAEdge } from './../../lib/types';
//import { Container, Box, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlowProvider, useStoreApi, NodeTypes, EdgeTypes, ReactFlow, 
  type Edge as ReactFlowEdge, type Node } from '@xyflow/react';

type CADiagramViewProps = {
  controller: CANode;
  presenter: CANode;
  viewModel: CANode;
  entities: CANode;
  inputData: CANode;
  inputBoundary: CANode;
  interactor: CANode;
  outputBoundary: CANode;
  outputData: CANode;
  dataAccessInterface: CANode;
  view: CANode;
  dataAccess: CANode;
  database: CANode;
  edges: CAEdge[];
  areNodesInteractive?: boolean;
  onNodeClick?: (info: NodeClickInfo) => void;
};

const nodeTypes = {graphNode: ReactFlowNode, panelNode: PanelNode};
const edgeTypes = { smart: ObstacleAwareSmartEdge};

const HANDLE_MAP: Record<string, { sourceHandle: string; targetHandle: string }> = {
  'edge-1': { sourceHandle: 'Controller-source', targetHandle: 'InputBoundary-target-left' },
  'edge-2': { sourceHandle: 'Controller-source', targetHandle: 'InputData-target-left' },
  'edge-3': { sourceHandle: 'Interactor-source-left', targetHandle: 'InputBoundary-target-right' },
  'edge-4': { sourceHandle: 'Interactor-source-right', targetHandle: 'OutputBoundary-target-right' },
  'edge-5': { sourceHandle: 'Interactor-source-bottom', targetHandle: 'OutputData-target-right' },
  'edge-6': { sourceHandle: 'Interactor-source-right', targetHandle: 'Entity-target' },
  'edge-7': { sourceHandle: 'Presenter-source-right', targetHandle: 'OutputBoundary-target-left' },
  'edge-8': { sourceHandle: 'Presenter-source-bottom', targetHandle: 'ViewModel-target-top' },
  'edge-9': { sourceHandle: 'View-source-top', targetHandle: 'ViewModel-target-bottom' },
  'edge-11': { sourceHandle: 'Interactor-source-bottom', targetHandle: 'Database-target' },
  'edge-12': { sourceHandle: 'DataAccess-source-right', targetHandle: 'Database-target' },
};

export function CADiagramView({
  controller,
  presenter,
  viewModel,
  entities,
  inputData,
  inputBoundary,
  interactor,
  outputBoundary,
  outputData,
  dataAccessInterface,
  view,
  dataAccess,
  database,
  edges,
  areNodesInteractive = false,
  onNodeClick,
}: CADiagramViewProps) {
  const diagramContainerRef = useRef<HTMLDivElement | null>(null);
  const diagramContentRef = useRef<HTMLDivElement | null>(null);
  //const [layoutVersion, setLayoutVersion] = useState(0);

  useEffect(() => {
    const container = diagramContainerRef.current;
    const content = diagramContentRef.current;
    if (!container) {
      return;
    }

    let rafId: number | null = null;
    const scheduleRecompute = () => {
      if (rafId !== null) {
        return;
      }
      rafId = requestAnimationFrame(() => {
        rafId = null;
        //setLayoutVersion((value) => value + 1);
      });
    };

    const resizeObserver = new ResizeObserver(scheduleRecompute);
    resizeObserver.observe(container);
    if (content) {
      resizeObserver.observe(content);
    }

    window.addEventListener('resize', scheduleRecompute);
    container.addEventListener('scroll', scheduleRecompute, { passive: true });
    scheduleRecompute();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleRecompute);
      container.removeEventListener('scroll', scheduleRecompute);
    };
  }, []);

  // Build a stable id->node lookup so each edge can resolve source/target nodes in O(1).
  const nodesById = useMemo(() => {
    const nodes = [
      controller,
      presenter,
      viewModel,
      entities,
      inputData,
      inputBoundary,
      interactor,
      outputBoundary,
      outputData,
      dataAccessInterface,
      view,
      dataAccess,
      database,
    ];

    return new Map(nodes.map((node) => [node.id, node]));
  }, [
    controller,
    presenter,
    viewModel,
    entities,
    inputData,
    inputBoundary,
    interactor,
    outputBoundary,
    outputData,
    dataAccessInterface,
    view,
    dataAccess,
    database,
  ]);

  function resolveMarkerEnd(edgeType: CAEdge['type']) {
    if (edgeType === 'ASSOCIATION') return undefined; // no arrowhead
    if (edgeType === 'INHERITANCE') return 'hollow-triangle';
    return 'filled-triangle';
  }

  function resolveEdgeColor(edgeStatus: CAEdge['status']) {
    if (edgeStatus === "VIOLATION" || edgeStatus === "INCORRECT_DEPENDENCY") return '#ff0000';
    return '#000000';
  }

  const graphEdges: Array<ReactFlowEdge> = [];
  edges.forEach((edge) => {
    const startNode = nodesById.get(edge.source)?.type;
    const endNode = nodesById.get(edge.target)?.type;

    if (!startNode || !endNode) {
      return null;
    }
    const handles = HANDLE_MAP[edge.id];
    graphEdges.push({
      id: edge.id,
      source: startNode,
      target: endNode,
      sourceHandle: handles?.sourceHandle,
      targetHandle: handles?.targetHandle,
      type: 'smart',
      markerEnd: resolveMarkerEnd(edge.type),
      style: { stroke: resolveEdgeColor(edge.status), strokeWidth: 2 },
    });
  });

  const graphNodes = useMemo(() => {
    const realNodes = Array.from(nodesById.values()).map((node) => {  
      return {id: node.type,
      type: 'graphNode',
      position: NODE_POSITIONS[node.type] ?? { x: 0, y: 0 },
      data: {
        ...node,
        isInteractive: areNodesInteractive,
        onNodeClick,
      },}
    });
    return [...realNodes, ...BACKGROUND_PANELS];
  }, [nodesById, areNodesInteractive, onNodeClick]);

  return (
    <div style={{ width: '100%', height: '60vh', borderRadius: '8px', border: '1px solid black'}}>
      <EdgeMarkerDefs />
      <ReactFlowProvider>
        <DiagramCanvas
          graphNodes={graphNodes}
          graphEdges={graphEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        />
      </ReactFlowProvider>
    </div>
  );
}

function useRealNodesInitialized() {
  const store = useStoreApi();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      const { nodeLookup } = store.getState();
      if (nodeLookup.size === 0) return;
      const allMeasured = Array.from(nodeLookup.values()).every(
        (n) => n.measured?.width && n.measured?.height
      );
      if (allMeasured) setInitialized(true);
    });
    return unsub;
  }, [store]);

  return initialized;
}

function DiagramCanvas({ graphNodes, graphEdges, nodeTypes, edgeTypes }: {
  graphNodes: Node[];
  graphEdges: ReactFlowEdge[];
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
}) {
  const nodesInitialized = useRealNodesInitialized();

  return (
    <ReactFlow
      edges={nodesInitialized ? graphEdges : []}
      nodes={graphNodes}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      attributionPosition="top-right"
      nodesDraggable={false}
    />
  );
}