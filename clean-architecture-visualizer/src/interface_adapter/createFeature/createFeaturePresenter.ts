import chalk from 'chalk';
import type { CreateFeatureOutputBoundary } from '../../use_case/createFeature/createFeatureOutputBoundary.js';
import type { CreateFeatureOutputData } from '../../use_case/createFeature/createFeatureOutputData.js';

export class CreateFeaturePresenter implements CreateFeatureOutputBoundary {
  constructor(private readonly outputData: CreateFeatureOutputData) {}

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
      chalk.green(`Feature ${this.outputData.getFeature()} has been created.`)
    );
  }

  private showFailView(error: string): void {
    console.log(chalk.red(error));
  }
}
