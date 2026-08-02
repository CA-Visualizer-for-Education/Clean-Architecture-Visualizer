export class CreateModuleUseCaseOutputData {
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
}
