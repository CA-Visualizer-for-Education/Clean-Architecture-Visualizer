export class CreateFeatureOutputData {
  private error: string | null = null;
  private feature = '';

  setFeature(feature: string): void {
    this.feature = feature;
  }

  getFeature(): string {
    return this.feature;
  }

  // Why the use case failed, or null when it succeeded.
  setError(error: string): void {
    this.error = error;
  }

  getError(): string | null {
    return this.error;
  }
}
