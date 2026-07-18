import type { GetFilesWithViolationsInputBoundary } from './getFilesWithViolationsInputBoundary.js';
import type { SessionDBAccessInterface } from '../../data_access/sessionDBAccessInterface.js';
import type { GetFilesWithViolationsOutputData } from './getFilesWithViolationsOutputData.js';

export class GetFilesWithViolationsInteractor implements GetFilesWithViolationsInputBoundary {
  constructor(
    private readonly db: SessionDBAccessInterface,
    private readonly outputdata: GetFilesWithViolationsOutputData
  ) {}

  async execute(): Promise<void> {
    const violatingNodes = this.db.getNodesByStatus('VIOLATION');

    const violatingNodesPaths = violatingNodes.map((node) => node.filePath);

    const filteredViolatingNodePaths = violatingNodesPaths.filter(
      (path): path is string => path != undefined
    );

    const uniqueNodesPaths = [...new Set(filteredViolatingNodePaths)];

    this.outputdata.setOutputData({
      total_violations: violatingNodes.length,
      files: uniqueNodesPaths,
    });
  }
}
