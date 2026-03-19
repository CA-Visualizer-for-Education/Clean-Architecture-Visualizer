import type { GetFileContentInputBoundary } from "../../use_case/getFileContent/getFileContentInputBoundary.js";

export class GetFileContentController {
    constructor(
            private readonly inputBoundary: GetFileContentInputBoundary
        ) {}
    
    execute(): void {
        this.inputBoundary.getFileContent();
    }
}