import type { CreateUseCaseInputData } from './createUseCaseInputData.js';

export interface CreateUseCaseInputBoundary {
  execute(createUseCaseInputData: CreateUseCaseInputData): Promise<void>;
}
