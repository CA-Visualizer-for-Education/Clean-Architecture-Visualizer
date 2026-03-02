export class GraphVerificationOutputData {
    constructor(
        private readonly useCaseGraphList: object[]
    ){}

    getUseCaseGraphs(): object[] {
        return this.useCaseGraphList;
    }
}