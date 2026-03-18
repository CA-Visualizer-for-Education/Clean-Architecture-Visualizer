export type CALayer = 'Frameworks' | 'InterfaceAdapters' | 'ApplicationBusinessRules' | 'EnterpriseBusinessRules';

export type CALayerKey = 'entities' | 'useCases' | 'adapters' | 'drivers';

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

export type CAComponentType = 
  | 'Controller' 
  | 'Presenter' 
  | 'View' 
  | 'ViewModel' 
  | 'InputBoundary' 
  | 'OutputBoundary' 
  | 'InputData' 
  | 'OutputData' 
  | 'Interactor' 
  | 'Entity' 
  | 'DataAccessInterface'
  | 'DataAccess'
  | 'Database';

// --- Violation Types ---
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

// --- Interaction Details (Graph Data) ---
export interface CANode {
  id: string;
  name?: string; 
  type: CAComponentType;
  layer: CALayer;
  file_path?: string;
  status: 'VALID' | 'MISSING' | 'VIOLATION';
}

export interface CAEdge {
  id: string;
  source: string;
  target: string;
  type: 'DEPENDENCY' | 'ASSOCIATION' | 'INHERITANCE';
  status: 'VALID' | 'VIOLATION' | 'INCORRECT_DEPENDENCY';
}

export interface InteractionDetail {
  interaction_name: string;
  nodes: CANode[];
  edges: CAEdge[];
}

// --- Summary Types ---
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

// --- CodeView Types ---
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
