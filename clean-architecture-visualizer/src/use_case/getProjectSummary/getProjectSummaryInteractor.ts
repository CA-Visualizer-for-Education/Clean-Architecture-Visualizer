import type { SessionDBAccessInterface } from '../../data_access/sessionDBAccessInterface.js';
import type { GetProjectSummaryInputBoundary } from './getProjectSummaryInputBoundary.js';
import type {
  GetProjectSummaryOutputData,
  ProjectSummaryResponse,
  UseCaseSummary,
} from './getProjectSummaryOutputData.js';

export class GetProjectSummaryInteractor
  implements GetProjectSummaryInputBoundary
{
  constructor(
    private readonly db: SessionDBAccessInterface,
    private readonly outputData: GetProjectSummaryOutputData
  ) {}

  async getProjectSummary(): Promise<void> {
    // populate output JSON response
    const result: ProjectSummaryResponse = {
      project_name: this.db.getProjectName(),
      total_use_cases: this.db.getNumUseCases(),
      total_violations: this.db.getNumViolations(),
      use_cases: this.formatUseCaseInfo(),
    };

    this.outputData.setOutputData(result);
  }

  formatUseCaseInfo(): UseCaseSummary[] {
    return this.db.getAllUseCases().map((uc) => ({
      id: uc.id,
      name: uc.name,
      violation_count: uc.violationEdges.length,
      interactions: [
        {
          interaction_id: uc.id,
          interaction_name: uc.name,
        },
      ],
    }));
  }
}
