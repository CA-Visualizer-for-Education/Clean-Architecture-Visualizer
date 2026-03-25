import type { GetLearningModeInputBoundary } from "../../use_case/getLearningMode/getLearningModeInputBoundary.js";

export class GetLearningModeController {
    constructor(
            private readonly inputBoundary: GetLearningModeInputBoundary
        ) {}
    
    async getLearningMode(): Promise<void> {
        await this.inputBoundary.getLearningMode();
    }
}