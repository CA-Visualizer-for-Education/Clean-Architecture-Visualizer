import chalk from 'chalk';
import type { GraphVerificationOutputBoundary } from '../../use_case/graphVerification/graphVerificationOutputBoundary.js';
import type { GraphVerificationOutputData } from '../../use_case/graphVerification/graphVerificationOutputData.js';

export class GraphVerificationPresenter implements GraphVerificationOutputBoundary {
  constructor(private readonly outputData: GraphVerificationOutputData) {}

  prepareSuccessView(): void {
    const lineContent = this.outputData.getLineContent();
    const lineColour = this.outputData.getLineColour();
    for (let line = 0; line < lineContent.length; line++) {
      if (lineColour[line]) {
        console.log(chalk.green(lineContent[line]));
      } else {
        console.log(chalk.red(lineContent[line]));
      }
    }
  }
}
