import type { CreateModuleUseCaseInputBoundary } from '../../use_case/createModuleUseCase/createModuleUseCaseInputBoundary.js';
import { CreateModuleUseCaseInputData } from '../../use_case/createModuleUseCase/createModuleUseCaseInputData.js';

export class CreateModuleUseCaseController {
  constructor(
    private readonly inputBoundary: CreateModuleUseCaseInputBoundary
  ) {}

  async execute(feature: string, useCaseName: string): Promise<void> {
    feature = feature.split(' ').join('');
    useCaseName = useCaseName.split(' ').join('')

    const inputData = new CreateModuleUseCaseInputData(feature, useCaseName);
    await this.inputBoundary.execute(inputData);
  }
}
