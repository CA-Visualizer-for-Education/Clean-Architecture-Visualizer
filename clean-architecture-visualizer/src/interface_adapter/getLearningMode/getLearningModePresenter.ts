import type { GetLearningModeOutputBoundary } from "../../use_case/getLearningMode/getLearningModeOutputBoundary.js";
import type { GetLearningModeOutputData } from "../../use_case/getLearningMode/getLearningModeOutputData.js";

export class GetLearningModePresenter implements GetLearningModeOutputBoundary {
    
    constructor(private readonly outputData: GetLearningModeOutputData) {}
    getOutputData(): string {
        return JSON.stringify(this.outputData.getOutputData(), null, 2);
    }
    
}