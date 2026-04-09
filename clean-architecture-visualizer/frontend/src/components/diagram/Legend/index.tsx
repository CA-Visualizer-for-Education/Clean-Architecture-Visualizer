import { useEffect, useId, useRef, useState } from 'react';
import { CANodeView } from '../CANodeView';
import { Edge } from '../Edge';
import type { ArrowHeadType, CANode, CAEdge } from '../../../lib/types';
import {
  EdgeAnchorEnd,
  EdgeAnchorStart,
  EdgeLegendItem,
  EdgePreview,
  LegendMedia,
  LegendItems,
  LegendLabel,
  LegendRoot,
  NodeLegendItem,
} from './styles';

type LegendEdgeItemProps = {
  label: string;
  arrowHeadType: ArrowHeadType;
  status: CAEdge['status'];
};

function LegendEdgeItem({ label, arrowHeadType, status }: LegendEdgeItemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Forces a redraw when the preview size changes.
  const [layoutVersion, setLayoutVersion] = useState(0);
  // Keeps the generated IDs unique and safe for DOM use.
  const id = useId().replace(/:/g, '_');

  const startNode: CANode = {
    id: `legend-edge-start-${id}`,
    type: 'Controller',
    layer: 'InterfaceAdapters',
    status: 'VALID',
  };

  const endNode: CANode = {
    id: `legend-edge-end-${id}`,
    type: 'Presenter',
    layer: 'InterfaceAdapters',
    status: 'VALID',
  };

  // Recompute the edge layout whenever the preview container resizes.
  useEffect(() => {
    const container = containerRef.current;
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
        setLayoutVersion((value) => value + 1);
      });
    };

    const observer = new ResizeObserver(scheduleRecompute);
    observer.observe(container);
    window.addEventListener('resize', scheduleRecompute);
    scheduleRecompute();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      window.removeEventListener('resize', scheduleRecompute);
    };
  }, []);

  return (
    <EdgeLegendItem spacing={1}>
      <LegendMedia>
        <EdgePreview ref={containerRef}>
          <EdgeAnchorStart data-ca-node-id={startNode.id} />
          <EdgeAnchorEnd data-ca-node-id={endNode.id} />
          <Edge
            startNode={startNode}
            endNode={endNode}
            status={status}
            arrowHeadType={arrowHeadType}
            containerRef={containerRef}
            routeHint={{ mode: 'straight', startSide: 'right', endSide: 'left' }}
            layoutVersion={layoutVersion}
          />
        </EdgePreview>
      </LegendMedia>
      <LegendLabel variant="body2">{label}</LegendLabel>
    </EdgeLegendItem>
  );
}

type LegendNodeItemProps = {
  label: string;
  node: CANode;
};

function LegendNodeItem({ label, node }: LegendNodeItemProps) {
  return (
    <NodeLegendItem spacing={1}>
      <LegendMedia>
        <CANodeView {...node} isInteractive={false} />
      </LegendMedia>
      <LegendLabel variant="body2">{label}</LegendLabel>
    </NodeLegendItem>
  );
}

export function Legend() {
  return (
    <LegendRoot elevation={0}>
      <LegendItems>
        <LegendEdgeItem label="Dependency" arrowHeadType="filledTriangle" status="VALID" />
        <LegendEdgeItem label="Implements" arrowHeadType="hollowTriangle" status="VALID" />
        <LegendEdgeItem label="Incorrect Dependency" arrowHeadType="filledTriangle" status="INCORRECT_DEPENDENCY" />

        <LegendNodeItem
          label="Component"
          node={{
            id: 'legend-node-component',
            name: 'Controller',
            type: 'Controller',
            layer: 'InterfaceAdapters',
            status: 'VALID',
          }}
        />

        <LegendNodeItem
          label="Missing Component"
          node={{
            id: 'legend-node-missing-component',
            name: 'Entities',
            type: 'Entity',
            layer: 'EnterpriseBusinessRules',
            status: 'MISSING',
          }}
        />

        <LegendNodeItem
          label="Error in Component"
          node={{
            id: 'legend-node-error-component',
            name: 'Controller',
            type: 'Controller',
            layer: 'InterfaceAdapters',
            status: 'VIOLATION',
          }}
        />
      </LegendItems>
    </LegendRoot>
  );
}
