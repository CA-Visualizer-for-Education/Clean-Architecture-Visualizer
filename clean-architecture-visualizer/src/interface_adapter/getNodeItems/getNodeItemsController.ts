import type { GetNodeItemsInputBoundary } from "../../use_case/getNodeItems/getNodeItemsInputBoundary.js";

export class GetNodeItemsController {
    constructor (
        private readonly inputBoundary: GetNodeItemsInputBoundary
    ) {}

    async execute(): Promise<void> {
        await this.inputBoundary.getNodeItems();
    }
}
