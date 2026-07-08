import type { CreateModuleUseCaseOutputData } from './createModuleUseCaseOutputData.js';

export interface CreateModuleUseCaseOutputBoundary {
  showSuccessView(
    createModuleUseCaseOutputData: CreateModuleUseCaseOutputData
  ): void;
  showFailView(error: string): void;
}
