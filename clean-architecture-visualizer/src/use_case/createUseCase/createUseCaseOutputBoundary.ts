export interface CreateUseCaseOutputBoundary {
  showSuccessView(): void;
  showFailView(error: string): void;
}
