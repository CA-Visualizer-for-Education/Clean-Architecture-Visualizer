import type { CreateFeatureInputBoundary } from '../../use_case/createFeature/createFeatureInputBoundary.js';
import { CreateFeatureInputData } from '../../use_case/createFeature/createFeatureInputData.js';

export class CreateFeatureController {
  constructor(private readonly inputBoundary: CreateFeatureInputBoundary) {}

  async execute(feature: string): Promise<void> {
    const createFeatureInputData = new CreateFeatureInputData(feature);
    await this.inputBoundary.execute(createFeatureInputData);
  }
}
