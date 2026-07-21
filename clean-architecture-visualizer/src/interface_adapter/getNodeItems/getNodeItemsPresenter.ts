import type { GetNodeItemsOutputData } from "../../use_case/getNodeItems/getNodeItemsOutputData.js";
import type { GetNodeItemsOutputBoundary } from "../../use_case/getNodeItems/getNodeItemsOutputBoundary.js";

export class GetNodeItemsPresenter implements GetNodeItemsOutputBoundary {

    constructor(private readonly outputData: GetNodeItemsOutputData) {}
    getOutputData(): object {
        return this.outputData.getOutputData();
    }

}
