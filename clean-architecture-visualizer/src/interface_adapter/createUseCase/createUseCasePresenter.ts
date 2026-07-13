import chalk from 'chalk';
import type { CreateUseCaseOutputBoundary } from '../../use_case/createUseCase/createUseCaseOutputBoundary.js';
import type { CreateUseCaseOutputData } from '../../use_case/createUseCase/createUseCaseOutputData.js';

export class CreateUseCasePresenter implements CreateUseCaseOutputBoundary {
  private error: string | null = null;

  showSuccessView(createUseCaseOutputData: CreateUseCaseOutputData) {
    console.log(
      chalk.green(
        `Usecase ${createUseCaseOutputData.getUseCase()} has been created.`
      )
    );
  }

  showFailView(error: string) {
    console.log(chalk.red(error));
    this.error = error;
  }

  getError(): string | null {
    return this.error;
  }
}
