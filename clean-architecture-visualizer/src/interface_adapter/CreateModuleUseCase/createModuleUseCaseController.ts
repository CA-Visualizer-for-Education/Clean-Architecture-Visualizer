import type { CreateModuleUseCaseInputBoundary } from '../../use_case/createModuleUseCase/createModuleUseCaseInputBoundary.js';

export class CreateModuleUseCaseController {
  constructor(
    private readonly inputBoundary: CreateModuleUseCaseInputBoundary
  ) {}

  async execute(): Promise<void> {
    await this.inputBoundary.execute();
  }
}
