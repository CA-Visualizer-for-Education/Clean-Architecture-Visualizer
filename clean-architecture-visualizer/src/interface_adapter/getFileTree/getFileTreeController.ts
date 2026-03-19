import type { GetFileTreeInputBoundary } from "../../use_case/getFileTree/getFileTreeInputBoundary.js";

export class GetFileTreeController {
    constructor(
            private readonly inputBoundary: GetFileTreeInputBoundary
        ) {}
    
    execute(): void {
        this.inputBoundary.getFileTree();
    }
}