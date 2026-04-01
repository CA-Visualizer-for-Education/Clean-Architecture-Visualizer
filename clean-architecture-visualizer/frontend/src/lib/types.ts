// Clean Architecture layer identifiers used across diagram and code view models.
export type CALayer = 'Frameworks' | 'InterfaceAdapters' | 'ApplicationBusinessRules' | 'EnterpriseBusinessRules';
export type CALayerKey = 'entities' | 'useCases' | 'adapters' | 'drivers';

// Canonical value sets; related union types are derived from these constants.
export const COMPONENT_TYPES = [
  'Controller',
  'Presenter',
  'View',
  'ViewModel',
  'InputBoundary',
  'OutputBoundary',
  'InputData',
  'OutputData',
  'Interactor',
  'Entity',
  'DataAccessInterface',
  'DataAccess',
  'Database',
] as const;
export type CAComponentType = (typeof COMPONENT_TYPES)[number];

export const NODE_STATUSES = ['VALID', 'MISSING', 'VIOLATION'] as const;
export type CANodeStatus = (typeof NODE_STATUSES)[number];

export const EDGE_TYPES = ['DEPENDENCY', 'ASSOCIATION', 'INHERITANCE'] as const;
export type CAEdgeType = (typeof EDGE_TYPES)[number];

export const EDGE_STATUSES = ['VALID', 'VIOLATION', 'INCORRECT_DEPENDENCY'] as const;
export type CAEdgeStatus = (typeof EDGE_STATUSES)[number];

// UI metadata for mapping architecture layers to palette groups and display labels.
interface LayerMetadata {
  paletteKey: CALayerKey;
  label: string;
}

export const LAYER_METADATA: Record<CALayer, LayerMetadata> = {
  EnterpriseBusinessRules: {
    paletteKey: 'entities',
    label: 'Enterprise Entity',
  },
  ApplicationBusinessRules: {
    paletteKey: 'useCases',
    label: 'Use Case',
  },
  InterfaceAdapters: {
    paletteKey: 'adapters',
    label: 'Interface Adapter',
  },
  Frameworks: {
    paletteKey: 'drivers',
    label: 'Frameworks & Drivers',
  },
};

// Core graph entities used by interaction detail views.
export interface CANode {
  id: string;
  name?: string;
  type: CAComponentType;
  layer: CALayer;
  file_path?: string;
  status: CANodeStatus;
}

export interface CAEdge {
  id: string;
  source: string;
  target: string;
  type: CAEdgeType;
  status: CAEdgeStatus;
}

export interface InteractionDetail {
  interaction_name: string;
  nodes: CANode[];
  edges: CAEdge[];
}

// Violation payloads attached to analysis and code navigation views.
export interface Violation {
  id: string;
  type: string;
  message: string;
  suggestion: string;
  related_node_ids: string[];
  related_edge_id?: string;
  file_context?: {
    file: string;
    line_number: number;
    snippet: string;
  };
}

// Summary endpoint models.
export interface Interaction {
  interaction_id: string;
  interaction_name: string;
}

export interface UseCase {
  id: string;
  name: string;
  violation_count: number;
  interactions?: Interaction[];
}

export interface AnalysisSummary {
  project_name: string;
  total_use_cases: number;
  total_violations: number;
  use_cases: UseCase[];
}

// Code view and file navigation models.
export interface FileNode {
  id: string;
  name: string;
  type: 'directory' | 'file';
  path: string;
  children?: FileNode[];
  hasViolation?: boolean;
  layer?: CALayer;
}

export interface FileContent {
  file_path: string;
  content: string;
  language: string;
  layer: CALayer;
  lines_with_violations: number[];
}

export type FileRelation = {
  line: number;
  target_file: string;
  type: string;
  description?: string;
  layer: CALayer;
};
