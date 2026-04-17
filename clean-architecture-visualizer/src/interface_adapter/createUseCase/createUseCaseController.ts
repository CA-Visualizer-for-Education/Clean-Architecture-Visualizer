import type { CreateUseCaseInputBoundary } from "../../use_case/createUseCase/createUseCaseInputBoundary.js";

export class CreateUseCaseController {
    constructor(
            private readonly inputBoundary: CreateUseCaseInputBoundary
        ) {}
    
    async execute(): Promise<void> {
        await this.inputBoundary.execute();
    }
}