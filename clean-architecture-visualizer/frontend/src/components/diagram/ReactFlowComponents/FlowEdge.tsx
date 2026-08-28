import { SmartEdge, smartEdgePresets } from '@tisoap/react-flow-smart-edge';
import { useStoreApi, type EdgeProps } from '@xyflow/react';

export function EdgeMarkerDefs() {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0 }}>
      <defs>
        <marker
          id="hollow-triangle"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="14"
          markerHeight="14"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill="white" stroke="black" strokeWidth="1" />
        </marker>

        <marker
          id="filled-triangle"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="14"
          markerHeight="14"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill="black" />
        </marker>
      </defs>
    </svg>
  );
}


export function ObstacleAwareSmartEdge(props: EdgeProps) {
  const store = useStoreApi();
  const { nodeLookup } = store.getState();

  const obstacleNodes = Array.from(nodeLookup.values())
    .filter((n) => n.type !== 'panelNode')
    .map((n) => ({
      ...n,
      width: n.measured?.width ?? n.width,
      height: n.measured?.height ?? n.height,
    }));

  console.log(
    'obstacles for edge', props.id, ':',
    JSON.stringify(obstacleNodes.map(n => ({ id: n.id, w: n.width, h: n.height })), null, 2)
  );

  return (
    <SmartEdge {...props} nodes={obstacleNodes} options={{ ...smartEdgePresets.step, nodePadding: 15 }} />
  );
}