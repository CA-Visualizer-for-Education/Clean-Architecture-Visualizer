import cleanNodeInfo from '../database/cleanArchStaticInfo.json' with {
  type: 'json',
};
import type { CleanNode } from '../types/cleanNode.js';
import type { CleanArchInfoAccessInterface } from './cleanArchInfoAccessInterface.js';

export class CleanArchAccess implements CleanArchInfoAccessInterface {
  getValidOutNeighbours(): Promise<Record<CleanNode, CleanNode[]>> {
    const outNeighboursOnly = Object.fromEntries(
      Object.entries(cleanNodeInfo.nodes).map(([key, value]) => [
        key,
        value.outNeighbours,
      ])
    );
    return Promise.resolve(outNeighboursOnly as Record<CleanNode, CleanNode[]>);
  }
}
