import { Paper, Typography } from '@mui/material';
import { mapNodeToVisual } from './mapNodeToVisual';
import type { CANode } from '../../../lib/types';

/**
 * Renders a visual representation of a Clean Architecture node.
 * 
 * @param props - The component props
 * @param props.node - The CANode data to be displayed
 * @returns A Material-UI Paper component displaying the node with layer-specific styling
 * 
 * @example
 * ```tsx
 * <CANode node={myCANode} />
 * ```
 */
export function CANodeView({ node }: { node: CANode }) {
  const visual = mapNodeToVisual(node);

  return (
    <Paper
      sx={{
        m: 2,
        backgroundColor: `${visual.layerColor}.main`,
        border: 2,
        borderColor: `${visual.layerColor}.contrastText`,
        color: `${visual.layerColor}.contrastText`,
        px: 2,
        py: 1,
        ...visual.statusStyle,
      }}
    >
      <Typography variant="body1" align="center" fontWeight="bold">
        {visual.title}
      </Typography>
    </Paper>
  );
}