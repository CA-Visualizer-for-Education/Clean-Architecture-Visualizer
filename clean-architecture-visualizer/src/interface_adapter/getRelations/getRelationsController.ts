import type { GetRelationsInputBoundary } from "../../use_case/getRelations/GetRelationsInputBoundary.js";

export class GetRelationsController {
    constructor(
            private readonly inputBoundary: GetRelationsInputBoundary
        ) {}
    
    async execute(): Promise<void> {
        await this.inputBoundary.execute();
    }
}