import type { cleanLayer } from '../../types/cleanLayer.js';
import type { cleanNode } from '../../types/cleanNode.js';

/** The response for GET /analysis/interaction/:id. */
export type UseCaseInfoResponse = {
  interaction_name: string;
  nodes: UseCaseNodeResponse[];
  edges: UseCaseEdgeResponse[];
  decoupling: boolean;
};

export type UseCaseNodeResponse = {
  id: string;
  name?: string;
  type: cleanNode;
  layer: cleanLayer;
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

  // An empty object when the use case wasn't found; the route sends it as is.
  getOutputData(): UseCaseInfoResponse | Record<string, never> {
    if (this.apiOutputData) return this.apiOutputData;
    return {};
  }
}
