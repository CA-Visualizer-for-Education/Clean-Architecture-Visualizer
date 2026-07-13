import type { CreateFeatureInputData } from './createFeatureInputData.js';

export interface CreateFeatureInputBoundary {
  execute(createFeatureInputData: CreateFeatureInputData): Promise<void>;
}
