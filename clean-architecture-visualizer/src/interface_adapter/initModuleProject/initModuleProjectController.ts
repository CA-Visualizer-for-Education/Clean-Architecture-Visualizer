import type { InitModuleProjectInputBoundary } from '../../use_case/initModuleProject/initModuleProjectInputBoundary.js';

export class InitModuleProjectController {
  constructor(private readonly inputBoundary: InitModuleProjectInputBoundary) {}

  async execute() {
    await this.inputBoundary.execute();
  }
}
