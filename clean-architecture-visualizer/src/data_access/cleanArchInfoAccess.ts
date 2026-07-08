import type { cleanNode } from '../types/cleanNode.js';

import type { CleanArchInfoAccessInterface } from './cleanArchInfoAccessInterface.js';

import cleanNodeInfo from '../database/cleanArchStaticInfo.json' with { type: 'json' };

export class CleanArchAccess implements CleanArchInfoAccessInterface {
  getValidOutNeighbours(): Promise<Record<cleanNode, cleanNode[]>> {
    const outNeighboursOnly = Object.fromEntries(
      Object.entries(cleanNodeInfo.nodes).map(([key, value]) => [
        key,
        value.outNeighbours,
      ])
    );
    return Promise.resolve(outNeighboursOnly as Record<cleanNode, cleanNode[]>);
  }
}
