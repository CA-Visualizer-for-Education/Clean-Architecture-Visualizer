import chalk from 'chalk';
import type { CreateFeatureOutputBoundary } from '../../use_case/createFeature/createFeatureOutputBoundary.js';
import type { CreateFeatureOutputData } from '../../use_case/createFeature/createFeatureOutputData.js';

export class CreateFeaturePresenter implements CreateFeatureOutputBoundary {
  private error: string | null = null;
  showSuccessView(createFeatureOutputData: CreateFeatureOutputData): void {
    console.log(
      chalk.green(
        `Feature ${createFeatureOutputData.getFeature()} has been created.`
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
