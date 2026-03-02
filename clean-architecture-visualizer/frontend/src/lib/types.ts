export type CALayer = 'Frameworks' | 'InterfaceAdapters' | 'ApplicationBusinessRules' | 'EnterpriseBusinessRules';

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