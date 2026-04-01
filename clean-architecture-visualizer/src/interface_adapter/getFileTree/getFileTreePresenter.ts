import type { GetFileTreeOutputData } from "../../use_case/getFileTree/getFileTreeOuptutData.js";
import type { GetFileTreeOutputBoundary } from "../../use_case/getFileTree/getFileTreeOutputBoundary.js";

export class GetFileTreePresenter implements GetFileTreeOutputBoundary {
    
    constructor(private readonly outputData: GetFileTreeOutputData) {}
    getOutputData(): string {
        return JSON.stringify(this.outputData.getOutputData(), null, 2);
    }
    
}