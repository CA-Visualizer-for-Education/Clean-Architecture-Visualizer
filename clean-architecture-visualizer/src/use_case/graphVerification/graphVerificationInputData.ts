export class GraphVerificationInputData {
    constructor(
        private readonly toCommandLine: boolean
    ) {}

    isToCommandLine(): boolean {
        return this.toCommandLine;
    }
}