export class CreateUseCaseOutputData {
  private error: string | null = null;
  private useCase = '';

  setUseCase(useCase: string): void {
    this.useCase = useCase;
  }

  getUseCase(): string {
    return this.useCase;
  }

  // Why the use case failed, or null when it succeeded.
  setError(error: string): void {
    this.error = error;
  }

  getError(): string | null {
    return this.error;
  }
}
