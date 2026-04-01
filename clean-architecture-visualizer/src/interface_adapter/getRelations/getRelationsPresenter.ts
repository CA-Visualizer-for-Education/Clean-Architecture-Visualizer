import type { GetRelationsOutputBoundary } from "../../use_case/getRelations/GetRelationsOutputBoundary.js";
import type { GetRelationsOutputData } from "../../use_case/getRelations/GetRelationsOutputData.js";

export class GetRelationsPresenter implements GetRelationsOutputBoundary {
    
    constructor(private readonly outputData: GetRelationsOutputData) {}
    getOutputData(): string {
        return JSON.stringify(this.outputData.getOutputData(), null, 2);
    }
    
}