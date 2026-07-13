import chalk from 'chalk';
import type { GraphVerificationOutputBoundary } from '../../use_case/graphVerification/graphVerificationOutputBoundary.js';
import type { GraphVerificationOutputData } from '../../use_case/graphVerification/graphVerificationOutputData.js';

export class GraphVerificationPresenter implements GraphVerificationOutputBoundary {
  prepareSuccessView(
    graphVerificationOutputData: GraphVerificationOutputData
  ): void {
    const lineContent = graphVerificationOutputData.getLineContent();
    const lineColour = graphVerificationOutputData.getLineColour();
    for (let line = 0; line < lineContent.length; line++) {
      if (lineColour[line]) {
        console.log(chalk.green(lineContent[line]));
      } else {
        console.log(chalk.red(lineContent[line]));
      }
    }
  }
}
