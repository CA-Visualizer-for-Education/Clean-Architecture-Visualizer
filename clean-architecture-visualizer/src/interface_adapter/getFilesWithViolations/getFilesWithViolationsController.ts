import type { GetFilesWithViolationsInputBoundary } from '../../use_case/getFilesWithViolations/getFilesWithViolationsInputBoundary.js';

export class GetFilesWithViolationsController {
  constructor(
    private readonly inputboundary: GetFilesWithViolationsInputBoundary
  ) {}

  async execute(): Promise<void> {
    await this.inputboundary.execute();
  }
}
