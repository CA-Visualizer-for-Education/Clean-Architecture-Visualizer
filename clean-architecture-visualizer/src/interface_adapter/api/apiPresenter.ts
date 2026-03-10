import type { APIOutputBoundary } from "../../use_case/api/apiOutputBoundary.js";
import type { APIOutputData } from "../../use_case/api/apiOutputData.js";

export class APIPresenter implements APIOutputBoundary {
    
    constructor(private readonly outputData: APIOutputData) {}
    getOutputData(): string {
        return JSON.stringify(this.outputData.getOutputData(), null, 2);
    }
    
}