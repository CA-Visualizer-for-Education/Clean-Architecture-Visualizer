import chalk from 'chalk';
import type { CreateUseCaseOutputBoundary } from '../../use_case/createUseCase/createUseCaseOutputBoundary.js';
import type { CreateUseCaseOutputData } from '../../use_case/createUseCase/createUseCaseOutputData.js';

export class CreateUseCasePresenter implements CreateUseCaseOutputBoundary {
  private error: string | null = null;

  constructor(private readonly outputData: CreateUseCaseOutputData) {}

  showSuccessView() {
    console.log(
      chalk.green(`Usecase ${this.outputData.getUseCase()} has been created.`)
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
