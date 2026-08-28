import { CANodeView, type CANodeViewProps } from '../CANodeView';
import { Handle, Position, NodeProps, Node} from '@xyflow/react';

import { Box, Typography } from '@mui/material';
import { type CANode } from '../../../lib/types';

export type PanelNodeData = {
  label: string;
  colorKey: string;
};

export const BACKGROUND_PANELS = [
  {
    id: 'panel-adapters',
    type: 'panelNode',
    position: { x: -40, y: -40 },
    style: { width: 215, height: 295, zIndex: -1 },
    data: { label: 'Interface Adapters', colorKey: 'adapters' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'panel-usecases',
    type: 'panelNode',
    position: { x: 185, y: -40 },
    style: { width: 450, height: 295, zIndex: -1 },
    data: { label: 'Application Business Rules', colorKey: 'useCases' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'panel-entities',
    type: 'panelNode',
    position: { x: 645, y: -40 },
    style: { width: 245, height: 295, zIndex: -1 },
    data: { label: 'Enterprise Business Rules', colorKey: 'entities' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'panel-drivers',
    type: 'panelNode',
    position: { x: -40, y: 265 },
    style: { width: 930, height: 130, zIndex: -1 },
    data: { label: 'Frameworks and Drivers', colorKey: 'drivers' },
    draggable: false,
    selectable: false,
  },
];

export const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  Controller: { x: 0, y: 40 },
  Presenter: { x: 0, y: 120 },
  ViewModel: { x: 0, y: 200 },

  InputData: { x: 220, y: 0 },
  InputBoundary: { x: 220, y: 50 },
  Interactor: { x: 440, y: 80 },
  OutputBoundary: { x: 220, y: 120 },
  OutputData: { x: 220, y: 170 },
  DataAccessInterface: { x: 440, y: 180 },

  Entity: { x: 680, y: 120 },

  View: { x: 0, y: 300 },
  DataAccess: { x: 440, y: 300 },
  Database: { x: 680, y: 300 },
};

function getNodeHandlers(nodeObject: CANode) {
  switch (nodeObject.type) {
    case 'Controller':
      return (<div>
        <Handle type="target" position={Position.Bottom} id="Controller-target" />
        <Handle type="source" position={Position.Right} id="Controller-source" />
      </div>);
    case 'Presenter':
      return (<div>
        <Handle type="target" position={Position.Top} id="Presenter-target" />
        <Handle type="source" position={Position.Bottom} id="Presenter-source-bottom" />
        <Handle type="source" position={Position.Right} id="Presenter-source-right" />
      </div>);
    case 'View':
      return (<div>
        <Handle type="target" position={Position.Right} id="View-target" />
        <Handle type="source" position={Position.Left} id="View-source-left" />
        <Handle type="source" position={Position.Top} id="View-source-top" />
      </div>);
    case 'ViewModel':
      return (<div>
        <Handle type="target" position={Position.Top} id="ViewModel-target-top" />
        <Handle type="target" position={Position.Bottom} id="ViewModel-target-bottom" />
        <Handle type="source" position={Position.Right} id="ViewModel-source" />
      </div>);
    case 'InputBoundary':
      return (<div>
        <Handle type="target" position={Position.Left} id="InputBoundary-target-left" />
        <Handle type="target" position={Position.Right} id="InputBoundary-target-right" />
        <Handle type="source" position={Position.Bottom} id="InputBoundary-source" />
      </div>);
    case 'OutputBoundary':
      return (<div>
        <Handle type="target" position={Position.Left} id="OutputBoundary-target-left" />
        <Handle type="target" position={Position.Right} id="OutputBoundary-target-right" />
        <Handle type="source" position={Position.Top} id="OutputBoundary-source" />
      </div>);
    case 'InputData':
      return (<div>
        <Handle type="target" position={Position.Left} id="InputData-target-left" />
        <Handle type="target" position={Position.Right} id="InputData-target-right" />
        <Handle type="source" position={Position.Right} id="InputData-source" style={{ top: '70%' }}/>
      </div>);
    case 'OutputData':
      return (<div>
        <Handle type="target" position={Position.Left} id="OutputData-target-left" />
        <Handle type="target" position={Position.Right} id="OutputData-target-right" />
        <Handle type="source" position={Position.Bottom} id="OutputData-source" />
      </div>);
    case 'Interactor':
      return (<div>
        <Handle type="source" position={Position.Bottom} id="Interactor-source-bottom" />
        <Handle type="source" position={Position.Left} id="Interactor-source-left" />
        <Handle type="source" position={Position.Right} id="Interactor-source-right" />
        <Handle type="target" position={Position.Bottom} id="Interactor-target" style={{ left: '70%' }}/>
      </div>);
    case 'Entity':
      return (<div>
        <Handle type="target" position={Position.Left} id="Entity-target" />
        <Handle type="source" position={Position.Bottom} id="Entity-source" />
      </div>);
    case 'DataAccessInterface':
      return (<div>
        <Handle type="target" position={Position.Top} id="DataAccessInterface-target-top"/>
        <Handle type="target" position={Position.Bottom} id="DataAccessInterface-target-bottom"/>
        <Handle type="source" position={Position.Right} id="DataAccessInterface-source"/>
      </div>);
    case 'DataAccess':
      return (<div>
        <Handle type="source" position={Position.Top} id="DataAccess-source-top" />
        <Handle type="source" position={Position.Right} id="DataAccess-source-right" />
        <Handle type="target" position={Position.Left} id="DataAccess-target"/>
      </div>);
    case 'Database':
      return (<div>
        <Handle type="target" position={Position.Left} id="Database-target"/>
        <Handle type="source" position={Position.Top} id="Database-source"/>
      </div>);
  }
}

export function ReactFlowNode({ data }: NodeProps<Node<CANodeViewProps>>) {
  return (
      <div style={{ width: 155, height: 40, overflow: 'hidden' }}>
          <CANodeView
              isInteractive={data.isInteractive}
              onNodeClick={data.onNodeClick}
              {...data}
          />
          {getNodeHandlers({...data})}
      </div>
  )
}

export function PanelNode({ data }: NodeProps<Node<PanelNodeData>>) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        border: 2,
        borderColor: `${data.colorKey}.contrastText`,
        bgcolor: `${data.colorKey}.light`,
        borderRadius: 2,
        p: 1,
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, fontSize: 'clamp(0.68rem, 0.8vw, 0.875rem)' }}
      >
        {data.label}
      </Typography>
    </Box>
  );
}