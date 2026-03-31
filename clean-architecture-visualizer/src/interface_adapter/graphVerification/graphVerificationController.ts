import type { GraphVerificationInputBoundary } from "../../use_case/graphVerification/graphVerificationInputBoundary.js";

export class GraphVerificationController {
    constructor(
        private readonly inputBoundary: GraphVerificationInputBoundary
    ) {}

    async execute(): Promise<void> {
        await this.inputBoundary.execute();
    }
}