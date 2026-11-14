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

  // Undefined when nothing was set, such as for an unknown use case id.
  getOutputData(): ViolationEntry[] | undefined {
    if (this.apiOutputData) return this.apiOutputData;
    return undefined;
  }
}
