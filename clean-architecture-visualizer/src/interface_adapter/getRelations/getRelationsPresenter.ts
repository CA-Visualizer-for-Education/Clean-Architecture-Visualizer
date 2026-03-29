import type { GetRelationsOutputBoundary } from "../../use_case/getRelations/GetRelationsOutputBoundary.js";
import type { GetRelationsOutputData } from "../../use_case/getRelations/GetRelationsOutputData.js";

export class GetRelationsPresenter implements GetRelationsOutputBoundary {
    
    constructor(private readonly outputData: GetRelationsOutputData) {}
    getOutputData(): object {
        return this.outputData.getOutputData();
    }
    
}