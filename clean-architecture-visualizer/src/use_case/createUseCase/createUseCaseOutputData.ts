export class CreateUseCaseOutputData {
  constructor(private readonly useCase: string) {}

  getUseCase(): string {
    return this.useCase;
  }
}
