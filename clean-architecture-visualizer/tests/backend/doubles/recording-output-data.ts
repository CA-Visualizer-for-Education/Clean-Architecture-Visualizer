// Stands in for a use case's Output Data and records what the Interactor sets.
// Reading `result` before setOutputData is called fails the test.
export class RecordingOutputData<T> {
  private recorded?: { value: T };

  setOutputData(value: T): void {
    this.recorded = { value };
  }

  getOutputData(): T | undefined {
    return this.recorded?.value;
  }

  get result(): T {
    if (!this.recorded) {
      throw new Error('setOutputData was not called');
    }
    return this.recorded.value;
  }
}
