import type { GraphVerificationInputBoundary } from "../../use_case/graphVerification/graphVerificationInputBoundary.js";

export class GraphVerificationController {
    constructor(
        private readonly _inputBoundary: GraphVerificationInputBoundary
    ) {}

    async execute(): Promise<void> {
        this._inputBoundary.execute();
    }
}