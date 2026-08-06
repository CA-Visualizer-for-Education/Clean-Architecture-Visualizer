export interface CreateModuleUseCaseOutputBoundary {
  showSuccessView(): void;
  showFailView(error: string): void;
}
