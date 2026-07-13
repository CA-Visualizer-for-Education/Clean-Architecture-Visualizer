import type { CreateUseCaseOutputData } from './createUseCaseOutputData.js';

export interface CreateUseCaseOutputBoundary {
  showSuccessView(createUseCaseOutputData: CreateUseCaseOutputData): void;
  showFailView(error: string): void;
}
