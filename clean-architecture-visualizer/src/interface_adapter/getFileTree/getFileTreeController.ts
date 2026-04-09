import type { GetFileTreeInputBoundary } from "../../use_case/getFileTree/getFileTreeInputBoundary.js";

export class GetFileTreeController {
    constructor(
            private readonly inputBoundary: GetFileTreeInputBoundary
        ) {}
    
    async execute(): Promise<void> {
        await this.inputBoundary.getFileTree();
    }
}