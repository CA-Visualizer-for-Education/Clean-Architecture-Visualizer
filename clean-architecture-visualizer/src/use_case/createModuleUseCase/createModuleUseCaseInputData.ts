export class CreateModuleUseCaseInputData {
  constructor(
    private readonly feature: string,
    private readonly usecase: string
  ) {}

  getFeatureName(): string {
    return this.feature;
  }

  getUseCaseName(): string {
    return this.usecase;
  }
}
