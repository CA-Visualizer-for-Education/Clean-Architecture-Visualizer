export class InitModuleProjectOutputData {
  private apiOutputData?: boolean;
  setOutputData(outputData: boolean) {
    this.apiOutputData = outputData;
  }

  getOutputData(): boolean {
    return this.apiOutputData ? this.apiOutputData : false;
  }
}
