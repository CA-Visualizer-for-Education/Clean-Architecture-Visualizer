import type { CreateFeatureInputBoundary } from '../../use_case/createFeature/createFeatureInputBoundary.js';

export class CreateFeatureController {
  constructor(private readonly inputBoundary: CreateFeatureInputBoundary) {}

  async execute(): Promise<void> {
    await this.inputBoundary.execute();
  }
}
