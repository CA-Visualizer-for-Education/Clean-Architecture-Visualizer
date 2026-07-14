import type { GetFilesWithViolationsOutputBoundary } from '../../use_case/getFilesWithViolations/getFilesWithViolationsOutputBoundary.js';
import type { GetFilesWithViolationsOutputData } from '../../use_case/getFilesWithViolations/getFilesWithViolationsOutputData.js';

export class GetFilesWithViolationsPresenter implements GetFilesWithViolationsOutputBoundary {
  constructor(private readonly outputData: GetFilesWithViolationsOutputData) {}

  getOutputData() {
    return this.outputData.getOutputData();
  }
}
