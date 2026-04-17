import { Typography } from '@mui/material';
import { NodePaper, type LayerColor } from './styles';
import { LAYER_METADATA, type CANode } from '../../../lib/types';

export type NodeClickInfo = {
  id: string;
  title: string;
  type: CANode['type'];
  layer: CANode['layer'];
  status?: CANode['status'];
  filePath?: string;
};

type CANodeViewProps = CANode & {
  isInteractive?: boolean;
  onNodeClick?: (info: NodeClickInfo) => void;
};

export function CANodeView({ isInteractive, onNodeClick, ...nodeObject }: CANodeViewProps) {
  const title = nodeObject.name ?? nodeObject.id;
  const layerColor: LayerColor = LAYER_METADATA[nodeObject.layer].paletteKey;

  const handleClick = () => {
    if (isInteractive && onNodeClick) {
      onNodeClick({
        id: nodeObject.id,
        title,
        type: nodeObject.type,
        layer: nodeObject.layer,
        status: nodeObject.status,
        filePath: nodeObject.file_path,
      });
    }
  };

  return (
    <NodePaper
      layerColor={layerColor}
      status={nodeObject.status}
      isInteractive={isInteractive}
      data-ca-node-id={nodeObject.id}
      onClick={handleClick}
    >
      <Typography variant="body2" align="center" fontWeight="bold" sx={{ fontSize: 'clamp(0.72rem, 0.9vw, 0.875rem)' }}>
        {title}
      </Typography>
    </NodePaper>
  );
}
