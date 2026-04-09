import type { CreateUseCaseOutputBoundary } from "../../use_case/createUseCase/createUseCaseOutputBoundary.js";
import type { CreateUseCaseOutputData } from "../../use_case/createUseCase/createUseCaseOutputData.js";

export class CreateUseCasePresenter implements CreateUseCaseOutputBoundary {
    
    constructor(private readonly outputData: CreateUseCaseOutputData) {}
    getOutputData(): boolean {
        return this.outputData.getOutputData();
    } 
}