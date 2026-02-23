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