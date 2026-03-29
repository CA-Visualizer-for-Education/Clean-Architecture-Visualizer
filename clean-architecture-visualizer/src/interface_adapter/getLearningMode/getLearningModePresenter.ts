import type { GetLearningModeOutputBoundary } from "../../use_case/getLearningMode/getLearningModeOutputBoundary.js";
import type { GetLearningModeOutputData } from "../../use_case/getLearningMode/getLearningModeOutputData.js";

export class GetLearningModePresenter implements GetLearningModeOutputBoundary {
    
    constructor(private readonly outputData: GetLearningModeOutputData) {}
    getOutputData(): object {
        return this.outputData.getOutputData();
    }
    
}