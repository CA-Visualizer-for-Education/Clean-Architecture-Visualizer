import type { GetProjectSummaryInputBoundary } from "./getProjectSummaryInputBoundary.js";
import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { GetProjectSummaryOutputData } from "./getProjectSummaryOutputData.js";

export class GetProjectSummaryInteractor implements GetProjectSummaryInputBoundary {

    constructor(
            private readonly db: SessionDBAccessInterface,
            private readonly outputData: GetProjectSummaryOutputData,
        ) {}

    async getProjectSummary(): Promise<void> {
        let result: { [key: string]: any } = {};

        // populate output JSON response
        const count = this.db.getNumUseCases()
        result.project_name = this.db.getProjectName();
        result.total_use_cases = count;
        result.total_violations = this.db.getNumViolations();
        result.use_cases = this.formatUseCaseInfo();

        this.outputData.setOutputData(result);
    }

    formatUseCaseInfo(): { [key: string]: any }[] {
        return this.db.getAllUseCases().map(uc => ({
            id: uc.id,
            name: uc.name,
            violation_count: uc.violationEdges.length,
            interactions: [{
                "interaction_id": uc.id,
                "interaction_name": uc.name
            }]
        }));
    }
}