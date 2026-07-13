import type { GraphVerificationInputBoundary } from '../../use_case/graphVerification/graphVerificationInputBoundary.js';
import { GraphVerificationInputData } from '../../use_case/graphVerification/graphVerificationInputData.js';
export class GraphVerificationController {
  constructor(private readonly inputBoundary: GraphVerificationInputBoundary) {}

  async execute(formatForCLI: boolean): Promise<void> {
    const inputData = new GraphVerificationInputData(formatForCLI);
    await this.inputBoundary.execute(inputData);
  }
}
