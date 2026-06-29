export class CreateFeatureInputData {
  constructor(private readonly feature: string) {}

  getFeatureName(): string {
    return this.feature;
  }
}
