/** The response for GET /analysis/files-with-violations. */
export type FilesWithViolationsResponse = {
  total_violations: number;
  files: string[];
};

export class GetFilesWithViolationsOutputData {
  private filesWithViolationsOutputData?: FilesWithViolationsResponse;

  setOutputData(OutputData: FilesWithViolationsResponse) {
    this.filesWithViolationsOutputData = OutputData;
  }

  getOutputData(): FilesWithViolationsResponse | Record<string, never> {
    if (this.filesWithViolationsOutputData)
      return this.filesWithViolationsOutputData;
    return {};
  }
}
