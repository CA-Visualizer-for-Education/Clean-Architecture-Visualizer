import chalk from 'chalk';
import type { CreateUseCaseOutputBoundary } from '../../use_case/createUseCase/createUseCaseOutputBoundary.js';
import type { CreateUseCaseOutputData } from '../../use_case/createUseCase/createUseCaseOutputData.js';

export class CreateUseCasePresenter implements CreateUseCaseOutputBoundary {
  constructor(private readonly outputData: CreateUseCaseOutputData) {}

  execute(): void {
    const error = this.outputData.getError();
    if (error === null) {
      this.showSuccessView();
    } else {
      this.showFailView(error);
    }
  }

  // Acts as a pseudo view model: server routes read this to pick a status.
  getError(): string | null {
    return this.outputData.getError();
  }

  private showSuccessView(): void {
    console.log(
      chalk.green(`Usecase ${this.outputData.getUseCase()} has been created.`)
    );
  }

  private showFailView(error: string): void {
    console.log(chalk.red(error));
  }
}
