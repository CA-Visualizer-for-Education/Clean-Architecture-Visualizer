/** The response for GET /analysis/summary. */
export type ProjectSummaryResponse = {
  project_name: string;
  total_use_cases: number;
  total_violations: number;
  use_cases: UseCaseSummary[];
};

export type UseCaseSummary = {
  id: string;
  name: string;
  violation_count: number;
  interactions: Array<{ interaction_id: string; interaction_name: string }>;
};

export class GetProjectSummaryOutputData {
  private summaryOutputData?: ProjectSummaryResponse;

  setOutputData(outputData: ProjectSummaryResponse) {
    this.summaryOutputData = outputData;
  }

  getOutputData(): ProjectSummaryResponse | Record<string, never> {
    if (this.summaryOutputData) return this.summaryOutputData;
    return {};
  }
}
