import { Typography } from '@mui/material';
import { NodePaper, type LayerColor } from './styles';
import { LAYER_METADATA, type CANode } from '../../../lib/types';

type CANodeViewProps = CANode & {
  isInteractive?: boolean;
};

export function CANodeView({ isInteractive, ...nodeObject }: CANodeViewProps) {
  const title = nodeObject.name ?? nodeObject.id;
  const layerColor: LayerColor = LAYER_METADATA[nodeObject.layer].paletteKey;

  return (
    <NodePaper
      layerColor={layerColor}
      status={nodeObject.status}
      isInteractive={isInteractive}
      data-ca-node-id={nodeObject.id}
    >
      <Typography variant="body1" align="center" fontWeight="bold">
        {title}
      </Typography>
    </NodePaper>
  );
}
