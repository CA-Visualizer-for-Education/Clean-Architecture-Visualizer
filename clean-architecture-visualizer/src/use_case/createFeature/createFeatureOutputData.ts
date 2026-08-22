export class CreateFeatureOutputData {
  private feature = '';

  setFeature(feature: string): void {
    this.feature = feature;
  }

  getFeature(): string {
    return this.feature;
  }
}
