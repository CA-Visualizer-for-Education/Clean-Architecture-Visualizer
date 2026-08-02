import type { InitProjectInputBoundary } from '../../use_case/initProject/initProjectInputBoundary.js';

export class InitProjectController {
  constructor(private readonly inputBoundary: InitProjectInputBoundary) {}

  async execute(): Promise<void> {
    await this.inputBoundary.execute();
  }
}
