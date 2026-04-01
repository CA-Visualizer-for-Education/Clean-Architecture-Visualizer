import type { GetViolationsInputBoundary } from "../../use_case/getViolations/GetViolationsInputBoundary.js";

export class GetViolationsController {
    constructor(
            private readonly inputBoundary: GetViolationsInputBoundary
        ) {}
    
    async execute(): Promise<void> {
        await this.inputBoundary.execute();
    }
}