import type { GraphVerificationOutputData } from './graphVerificationOutputData.js';

export interface GraphVerificationOutputBoundary {
  prepareSuccessView(
    graphVerificationOutputData: GraphVerificationOutputData
  ): void;
}
