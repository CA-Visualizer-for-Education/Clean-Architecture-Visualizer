import type { CleanLayer } from '../../types/clean-layer.js';
import type { CleanNode } from '../../types/cleanNode.js';

export type UseCaseInfoResponse = {
  interaction_name: string;
  nodes: UseCaseNodeResponse[];
  edges: UseCaseEdgeResponse[];
  decoupling: boolean;
};

export type UseCaseNodeResponse = {
  id: string;
  name?: string;
  type: CleanNode;
  layer: CleanLayer;
  file_path?: string;
  status: 'VALID' | 'MISSING' | 'VIOLATION';
};

export type UseCaseEdgeResponse = {
  id: string;
  source: string;
  target: string;
  type: 'DEPENDENCY' | 'IMPLEMENTS';
  status: 'VALID' | 'INCORRECT_DEPENDENCY';
};

export class GetUseCaseInfoOutputData {
  private apiOutputData?: UseCaseInfoResponse;

  setOutputData(outputData: UseCaseInfoResponse) {
    this.apiOutputData = outputData;
  }

  // An empty object when nothing was set, such as for an unknown use case id.
  getOutputData(): UseCaseInfoResponse | Record<string, never> {
    if (this.apiOutputData) return this.apiOutputData;
    return {};
  }
}
