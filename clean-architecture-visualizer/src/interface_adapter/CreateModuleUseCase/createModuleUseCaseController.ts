import type { CreateModuleUseCaseInputBoundary } from '../../use_case/createModuleUseCase/createModuleUseCaseInputBoundary.js';
import { CreateModuleUseCaseInputData } from '../../use_case/createModuleUseCase/createModuleUseCaseInputData.js';

export class CreateModuleUseCaseController {
  constructor(
    private readonly inputBoundary: CreateModuleUseCaseInputBoundary
  ) {}

  async execute(feature: string, usecase: string): Promise<void> {
    const createModuleUseCaseInputData = new CreateModuleUseCaseInputData(
      feature,
      usecase
    );
    await this.inputBoundary.execute(createModuleUseCaseInputData);
  }
}
