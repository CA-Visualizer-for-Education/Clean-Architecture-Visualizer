import type { GetProjectSummaryOutputBoundary } from "../../use_case/getProjectSummary/getProjectSummaryOutputBoundary.js";
import type { GetProjectSummaryOutputData } from "../../use_case/getProjectSummary/getProjectSummaryOutputData.js";

export class GetProjectSummaryPresenter implements GetProjectSummaryOutputBoundary {
    
    constructor(private readonly outputData: GetProjectSummaryOutputData) {}
    getOutputData(): object {
        // return JSON.stringify(this.outputData.getOutputData(), null, 2);
        return this.outputData.getOutputData();
    }
    
}