import type { GetRelationsInputBoundary } from "../../use_case/getRelations/GetRelationsInputBoundary.js";

export class GetRelationsController {
    constructor(
            private readonly inputBoundary: GetRelationsInputBoundary
        ) {}
    
    execute(): void {
        this.inputBoundary.execute();
    }
}