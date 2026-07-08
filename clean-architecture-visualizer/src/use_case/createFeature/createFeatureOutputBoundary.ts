import type { CreateFeatureOutputData } from './createFeatureOutputData.js';

export interface CreateFeatureOutputBoundary {
  showSuccessView(createFeatureOutputData: CreateFeatureOutputData): void;
  showFailView(error: string): void;
}
