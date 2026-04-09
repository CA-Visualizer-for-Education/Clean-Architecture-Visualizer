import type { GetFileContentOutputBoundary } from "../../use_case/getFileContent/getFileContentOutputBoundary.js";
import type { GetFileContentOutputData } from "../../use_case/getFileContent/getFileContentOutputData.js";

export class GetFileContentPresenter implements GetFileContentOutputBoundary {
    
    constructor(private readonly outputData: GetFileContentOutputData) {}
    getOutputData(): object {
        return this.outputData.getOutputData();
    }
    
}