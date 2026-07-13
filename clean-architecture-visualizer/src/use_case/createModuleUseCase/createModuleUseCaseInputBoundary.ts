import type { CreateModuleUseCaseInputData } from './createModuleUseCaseInputData.js';

export interface CreateModuleUseCaseInputBoundary {
  execute(
    createModuleUseCaseInputData: CreateModuleUseCaseInputData
  ): Promise<void>;
}
