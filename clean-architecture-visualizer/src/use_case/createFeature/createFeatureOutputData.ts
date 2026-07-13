export class CreateFeatureOutputData {
  constructor(private readonly feature: string) {}

  getFeature(): string {
    return this.feature;
  }
}
