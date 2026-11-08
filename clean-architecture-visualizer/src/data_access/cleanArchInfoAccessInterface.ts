import type { CleanNode } from '../types/cleanNode.js';

export interface CleanArchInfoAccessInterface {
  getValidOutNeighbours(): Promise<Record<CleanNode, CleanNode[]>>;
}
