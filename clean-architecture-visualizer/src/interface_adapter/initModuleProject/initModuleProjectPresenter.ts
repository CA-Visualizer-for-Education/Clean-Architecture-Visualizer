import type { InitModuleProjectOutputBoundary } from '../../use_case/initModuleProject/initModuleProjectOutputBoundary.js';
import type { InitModuleProjectOutputData } from '../../use_case/initModuleProject/initModuleProjectOutputData.js';

export class InitModuleProjectPresenter implements InitModuleProjectOutputBoundary {
  constructor(private readonly outputData: InitModuleProjectOutputData) {}
  getOutputData(): boolean {
    return this.outputData.getOutputData();
  }
}
