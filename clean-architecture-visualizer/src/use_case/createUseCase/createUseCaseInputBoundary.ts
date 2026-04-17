export interface CreateUseCaseInputBoundary {
    execute(): Promise<void>;
    newUseCase(inputData: string): void;
}