import type { GetProjectSummaryInputBoundary } from "../../use_case/getProjectSummary/getProjectSummaryInputBoundary.js";

export class GetProjectSummaryController {
    constructor(
            private readonly inputBoundary: GetProjectSummaryInputBoundary
        ) {}
    
    async execute(): Promise<void> {
        await this.inputBoundary.getProjectSummary();
    }
}