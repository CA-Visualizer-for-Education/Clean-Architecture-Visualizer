export type FilesWithViolationsResponse = {
  total_violations: number;
  files: string[];
};

export class GetFilesWithViolationsOutputData {
  private filesWithViolationsOutputData?: FilesWithViolationsResponse;

  setOutputData(OutputData: FilesWithViolationsResponse) {
    this.filesWithViolationsOutputData = OutputData;
  }

  // An empty object when nothing was set.
  getOutputData(): FilesWithViolationsResponse | Record<string, never> {
    if (this.filesWithViolationsOutputData)
      return this.filesWithViolationsOutputData;
    return {};
  }
}
