export class CreateModuleUseCaseOutputData {
  private error: string | null = null;
  private feature = '';
  private usecase = '';

  setFeature(feature: string): void {
    this.feature = feature;
  }

  setUseCase(usecase: string): void {
    this.usecase = usecase;
  }

  getFeature(): string {
    return this.feature;
  }

  getUseCase(): string {
    return this.usecase;
  }

  // Why the use case failed, or null when it succeeded.
  setError(error: string): void {
    this.error = error;
  }

  getError(): string | null {
    return this.error;
  }
}
