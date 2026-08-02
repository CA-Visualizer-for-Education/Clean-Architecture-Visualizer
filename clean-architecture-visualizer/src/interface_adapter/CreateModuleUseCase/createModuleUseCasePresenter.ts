import chalk from 'chalk';
import type { CreateModuleUseCaseOutputBoundary } from '../../use_case/createModuleUseCase/createModuleUseCaseOutputBoundary.js';
import type { CreateModuleUseCaseOutputData } from '../../use_case/createModuleUseCase/createModuleUseCaseOutputData.js';

export class CreateModuleUseCasePresenter implements CreateModuleUseCaseOutputBoundary {
  private error: string | null = null;

  constructor(private readonly outputData: CreateModuleUseCaseOutputData) {}

  showSuccessView(): void {
    console.log(
      chalk.green(
        `Usecase ${this.outputData.getUseCase()} in feature ${this.outputData.getFeature()} has been created.`
      )
    );
  }

  showFailView(error: string): void {
    console.log(chalk.red(error));
    this.error = error;
  }

  getError(): string | null {
    return this.error;
  }
}
