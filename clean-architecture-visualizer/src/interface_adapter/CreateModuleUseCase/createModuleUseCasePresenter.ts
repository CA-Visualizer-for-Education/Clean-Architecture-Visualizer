import chalk from 'chalk';
import type { CreateModuleUseCaseOutputBoundary } from '../../use_case/createModuleUseCase/createModuleUseCaseOutputBoundary.js';
import type { CreateModuleUseCaseOutputData } from '../../use_case/createModuleUseCase/createModuleUseCaseOutputData.js';

export class CreateModuleUseCasePresenter implements CreateModuleUseCaseOutputBoundary {
  private error: string | null = null;
  showSuccessView(
    createModuleUseCaseOutputData: CreateModuleUseCaseOutputData
  ): void {
    console.log(
      chalk.green(
        `Usecase ${createModuleUseCaseOutputData.getUseCase()} in feature ${createModuleUseCaseOutputData.getFeature()} has been created.`
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
