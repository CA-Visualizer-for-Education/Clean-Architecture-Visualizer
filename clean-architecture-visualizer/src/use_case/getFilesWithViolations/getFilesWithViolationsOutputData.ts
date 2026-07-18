export class GetFilesWithViolationsOutputData {
  private filesWithViolationsOutputData?: { [key: string]: any };

  setOutputData(OutputData: { [key: string]: any }) {
    this.filesWithViolationsOutputData = OutputData;
  }

  getOutputData(): object {
    if (this.filesWithViolationsOutputData)
      return this.filesWithViolationsOutputData;
    return {};
  }
}
