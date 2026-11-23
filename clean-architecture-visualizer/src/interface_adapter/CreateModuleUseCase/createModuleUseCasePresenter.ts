import chalk from 'chalk';
import type { CreateModuleUseCaseOutputBoundary } from '../../use_case/createModuleUseCase/createModuleUseCaseOutputBoundary.js';
import type { CreateModuleUseCaseOutputData } from '../../use_case/createModuleUseCase/createModuleUseCaseOutputData.js';

export class CreateModuleUseCasePresenter
  implements CreateModuleUseCaseOutputBoundary
{
  constructor(private readonly outputData: CreateModuleUseCaseOutputData) {}

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
      chalk.green(
        `Usecase ${this.outputData.getUseCase()} in feature ${this.outputData.getFeature()} has been created.`
      )
    );
  }

  private showFailView(error: string): void {
    console.log(chalk.red(error));
  }
}
