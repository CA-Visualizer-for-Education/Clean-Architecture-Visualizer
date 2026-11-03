/** One entry in the response for GET /analysis/violations/:interactionId. */
export type ViolationEntry = {
  id: string;
  type: 'INCORRECT_DEPENDENCY';
  message: string;
  suggestion: string;
  related_node_ids: string[];
  related_edge_id: string;
  file_context?: FileContext;
};

export type FileContext = {
  file: string;
  line_number?: number;
  snippet?: string;
};

export class GetViolationsOutputData {
  private apiOutputData?: ViolationEntry[];

  setOutputData(outputData: ViolationEntry[]) {
    this.apiOutputData = outputData;
  }

  // An empty object when the use case wasn't found; the route sends it as is.
  getOutputData(): ViolationEntry[] | Record<string, never> {
    if (this.apiOutputData) return this.apiOutputData;
    return {};
  }
}
