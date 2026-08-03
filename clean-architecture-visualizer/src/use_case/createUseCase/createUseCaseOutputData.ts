export class CreateUseCaseOutputData {
  private useCase = '';

  setUseCase(useCase: string): void {
    this.useCase = useCase;
  }

  getUseCase(): string {
    return this.useCase;
  }
}
