import type { GetViolationsInputBoundary } from "../../use_case/getViolations/GetViolationsInputBoundary.js";

export class GetViolationsController {
    constructor(
            private readonly inputBoundary: GetViolationsInputBoundary
        ) {}
    
    execute(): void {
        this.inputBoundary.execute();
    }
}