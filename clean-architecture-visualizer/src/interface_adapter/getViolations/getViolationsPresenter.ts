import type { GetViolationsOutputBoundary } from '../../use_case/getViolations/GetViolationsOutputBoundary.js';
import type { GetViolationsOutputData } from '../../use_case/getViolations/GetViolationsOutputData.js';

export class GetViolationsPresenter implements GetViolationsOutputBoundary {
  constructor(private readonly outputData: GetViolationsOutputData) {}
  getOutputData(): object | undefined {
    if (this.outputData.getOutputData()) {
      return this.outputData.getOutputData();
    }
    return undefined;
  }
}
