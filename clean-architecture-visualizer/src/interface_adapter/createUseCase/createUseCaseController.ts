import type { CreateUseCaseInputBoundary } from '../../use_case/createUseCase/createUseCaseInputBoundary.js';
import { CreateUseCaseInputData } from '../../use_case/createUseCase/createUseCaseInputData.js';

export class CreateUseCaseController {
  constructor(private readonly inputBoundary: CreateUseCaseInputBoundary) {}

  async execute(useCase: string): Promise<void> {
    const createUseCaseInputData = new CreateUseCaseInputData(useCase);
    await this.inputBoundary.execute(createUseCaseInputData);
  }
}
