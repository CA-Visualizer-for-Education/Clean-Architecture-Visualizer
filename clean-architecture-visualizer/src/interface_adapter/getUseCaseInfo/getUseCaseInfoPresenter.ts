import type { GetUseCaseInfoOutputBoundary } from '../../use_case/getUseCaseInfo/getUseCaseInfoOutputBoundary.js';
import type { GetUseCaseInfoOutputData } from '../../use_case/getUseCaseInfo/getUseCaseInfoOutputData.js';

export class GetUseCaseInfoPresenter implements GetUseCaseInfoOutputBoundary {
  constructor(private readonly outputData: GetUseCaseInfoOutputData) {}
  getOutputData(): object | undefined {
    if (this.outputData.getOutputData()) {
      return this.outputData.getOutputData();
    }
    return undefined;
  }
}
