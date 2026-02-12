import type { useCaseGraph } from "../../entities/useCaseGraph.js";

export class GraphVerificationOutputData {
    constructor(
        private readonly _useCaseGraphList: useCaseGraph[]
    ){}

    getUseCaseGraphs(): useCaseGraph[] {
        return this._useCaseGraphList;
    }
}