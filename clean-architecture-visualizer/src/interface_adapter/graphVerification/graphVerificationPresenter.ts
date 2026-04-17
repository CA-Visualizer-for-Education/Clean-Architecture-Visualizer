import type { GraphVerificationOutputBoundary } from "../../use_case/graphVerification/graphVerificationOutputBoundary.js";
import type { GraphVerificationOutputData } from "../../use_case/graphVerification/graphVerificationOutputData.js";

export class GraphVerificationPresenter implements GraphVerificationOutputBoundary {
    
    constructor(private readonly outputData: GraphVerificationOutputData) {}
    getOutputData(): [string[], boolean[]] {
        return [this.outputData.getLineContent(), this.outputData.getLineColour()];
    } 
}