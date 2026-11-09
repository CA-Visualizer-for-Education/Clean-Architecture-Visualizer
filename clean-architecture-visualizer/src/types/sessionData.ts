import type { CleanLayer } from './clean-layer.js';
import type { CleanNode } from './cleanNode.js';
import type { NeighborMap } from './neighbourMap.js';

export type SessionData = {
  projectName: string;
  numUseCases: number;
  numViolations: number;
  useCases: Array<{
    id: string;
    name: string;
    outNeighbours: NeighborMap;
    fileKeys: string[]; // refers to the files map
    violationEdges: [CleanNode, CleanNode][];
    missingNodes: CleanNode[];
  }>;
  files: FileStorage[];
  edges: EdgeStorage[];
  nodes: NodeStorage[];
};

export type FileStorage = {
  filePath: string;
  fileType: 'java' | 'python' | 'javascript' | 'typescript' | 'unknown';
  layer: CleanLayer;
  node: CleanNode;
};

export type EdgeStorage = {
  id: string;
  source: string; // Node Name
  target: string; // Node Name
  type: 'DEPENDENCY' | 'IMPLEMENTS';
  status: 'VALID' | 'INCORRECT_DEPENDENCY';
};

export type NodeStorage = {
  id: string;
  name?: string;
  filePath?: string;
  type: CleanNode;
  layer: CleanLayer;
  status: 'VALID' | 'MISSING' | 'VIOLATION';
};
