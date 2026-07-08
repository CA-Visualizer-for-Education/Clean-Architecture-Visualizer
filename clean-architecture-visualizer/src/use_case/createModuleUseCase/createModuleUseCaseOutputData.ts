export class CreateModuleUseCaseOutputData {
  constructor(
    private readonly feature: string,
    private readonly usecase: string
  ) {}

  getFeature(): string {
    return this.feature;
  }

  getUseCase(): string {
    return this.usecase;
  }
}
