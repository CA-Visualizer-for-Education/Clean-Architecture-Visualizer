import type { GetFileContentInputBoundary } from "../../use_case/getFileContent/getFileContentInputBoundary.js";

export class GetFileContentController {
    constructor(
            private readonly inputBoundary: GetFileContentInputBoundary
        ) {}
    
    async execute(): Promise<void> {
        this.inputBoundary.getFileContent();
    }
}