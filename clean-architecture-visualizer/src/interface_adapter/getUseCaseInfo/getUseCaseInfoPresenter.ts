import type { GetUseCaseInfoOutputBoundary } from "../../use_case/getUseCaseInfo/getUseCaseInfoOutputBoundary.js";
import type { GetUseCaseInfoOutputData } from "../../use_case/getUseCaseInfo/getUseCaseInfoOutputData.js";

export class GetUseCaseInfoPresenter implements GetUseCaseInfoOutputBoundary {
    
    constructor(private readonly outputData: GetUseCaseInfoOutputData) {}
    getOutputData(): string {
        return JSON.stringify(this.outputData.getOutputData(), null, 2);
    }
    
}